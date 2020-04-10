#!/usr/bin/env python3
# Copyright 2004-present Facebook. All Rights Reserved.

import asyncio
import dataclasses
import json
import logging
import sys
import time
from typing import Any, Dict, List

from tglib import ClientType, init
from tglib.clients import APIServiceClient
from tglib.exceptions import ClientRuntimeError
from tglib.utils.dict import deep_update

from . import jobs
from .routes import routes


@dataclasses.dataclass
class Job:
    """Struct for representing pipeline job configurations."""

    name: str
    start_time_ms: int
    params: Dict


async def produce(queue: asyncio.Queue, name: str, pipeline: Dict[str, Any]) -> None:
    """Add jobs from the pipeline configuration to the shared queue."""
    # Restrict pipeline frequency to reduce load on E2E
    if pipeline["period"] < 60:
        raise ValueError("Pipeline's 'period' cannot be less than 60 seconds")

    client = APIServiceClient(timeout=5)
    while True:
        start_time = time.time()
        network_info = {}

        topologies = await client.request_all("getTopology", return_exceptions=True)
        for network_name, topology in topologies.items():
            if isinstance(topology, ClientRuntimeError):
                logging.error(f"Failed to fetch topology for {network_name}")
                continue

            # Request default routes in batches to reduce load on E2E
            batch_size = 10
            batch_results = []
            unbatched_params = [node["name"] for node in topology["nodes"]]
            try:
                for i in range(0, len(unbatched_params), batch_size):
                    batched_params = unbatched_params[i : i + batch_size]  # noqa: E203
                    batch_results.append(
                        await client.request(
                            network_name,
                            "getDefaultRoutes",
                            params={"nodes": batched_params},
                        )
                    )
            except ClientRuntimeError:
                logging.exception(f"Failed to fetch default routes for {network_name}")
                continue

            # Put the batched results together
            default_routes: Dict[str, Dict[str, List[List[str]]]] = {}
            for i, result in enumerate(batch_results, 1):
                # Ignore the result if we got an E2EAck
                if "defaultRoutes" in result:
                    deep_update(default_routes, result)
                else:
                    logging.error(f"Batch request #{i} failed for {network_name}")

            # Check if all batches failed
            if not default_routes:
                logging.error(f"All batch requests failed for {network_name}")
                continue

            network_info[network_name] = {**topology, **default_routes}

        tasks = [
            queue.put(
                Job(
                    name=job["name"],
                    start_time_ms=int(round(start_time * 1e3)),
                    params={**job.get("params", {}), "network_info": network_info},
                )
            )
            for job in pipeline.get("jobs", [])
            if job.get("enabled", False)
        ]

        # Add jobs to the queue
        await asyncio.gather(*tasks)

        # Sleep until next invocation time
        sleep_time = start_time + pipeline["period"] - time.time()

        logging.info(
            f"Done enqueuing jobs in the '{name}' pipeline. "
            f"Added {len(tasks)} job(s) to the queue. Sleeping for {sleep_time}s"
        )
        await asyncio.sleep(sleep_time)


async def consume(queue: asyncio.Queue) -> None:
    """Consume and run a job from the shared queue."""
    while True:
        # Wait for a job from the producers
        job = await queue.get()
        logging.info(f"Starting the {job.name} job")

        # Execute the job
        function = getattr(jobs, job.name)
        await function(job.start_time_ms, **job.params)
        logging.info(f"Finished running the {job.name} job")


async def async_main(config: Dict[str, Any]) -> None:
    """Start producer and consumer coroutines."""
    logging.info("#### Starting the 'default_routes_service' ####")
    logging.debug(f"service config: {config}")

    q: asyncio.Queue = asyncio.Queue()

    # Create producer coroutines
    producers = [
        produce(q, name, pipeline) for name, pipeline in config["pipelines"].items()
    ]

    # Create consumer coroutines
    consumers = [consume(q) for _ in range(config["num_consumers"])]

    # Start the producer and consumer coroutines
    await asyncio.gather(*producers, *consumers)


def main() -> None:
    try:
        with open("./service_config.json") as f:
            config = json.load(f)
    except (json.JSONDecodeError, OSError):
        logging.exception(f"Failed to parse service configuration file")
        sys.exit(1)

    init(
        lambda: async_main(config),
        {
            ClientType.API_SERVICE_CLIENT,
            ClientType.MYSQL_CLIENT,
            ClientType.PROMETHEUS_CLIENT,
        },
        routes,
    )
