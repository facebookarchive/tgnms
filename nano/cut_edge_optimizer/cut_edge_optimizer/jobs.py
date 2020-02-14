#!/usr/bin/env python3
# Copyright 2004-present Facebook. All Rights Reserved.

import asyncio
import logging
from typing import List

from tglib.clients import APIServiceClient
from tglib.exceptions import ClientRuntimeError

from .config_operations import get_all_cut_edge_configs


async def cut_edge_finder(
    start_time: int,
    config_change_interval_s: int,
    link_flap_backoff_ms: str,
    link_impairment_detection: bool,
) -> None:
    """
    Use `getTopology` API request to fetch the latest topology
    Find all the edges that cut off one or more CNs and change link flap backoff and
    link impairment detection configs on them
    """
    logging.info("Fetching topologies for all networks from API service")
    client = APIServiceClient(timeout=2)
    all_topologies = await client.request_all("getTopology", return_exceptions=True)
    coroutines: List = []
    for network_name, topology in all_topologies.items():
        if isinstance(topology, ClientRuntimeError):
            logging.error(f"Error in fetching topology for {network_name}.")
        else:
            coroutines.append(
                get_all_cut_edge_configs(
                    network_name,
                    topology,
                    link_flap_backoff_ms,
                    link_impairment_detection,
                    config_change_interval_s,
                )
            )

    await asyncio.gather(*coroutines)
