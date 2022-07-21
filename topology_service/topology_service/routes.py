#!/usr/bin/env python3

# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import json
from datetime import datetime
from functools import partial
from typing import Any

from aiohttp import web
from sqlalchemy import select
from tglib.clients import APIServiceClient, MySQLClient

from .models import TopologyHistory


routes = web.RouteTableDef()


def custom_serializer(obj: Any) -> str:
    if isinstance(obj, datetime):
        return datetime.isoformat(obj)
    else:
        return str(obj)


@routes.get("/topology")
async def handle_get_topology(request: web.Request) -> web.Response:
    """
    ---
    description: Fetch all of a network's topologies between a given UTC datetime range.
    tags:
    - Topology History
    produces:
    - application/json
    parameters:
    - in: query
      name: network_name
      description: The name of the network
      required: true
      type: string
    - in: query
      name: start_dt
      description: The start UTC offset-naive datetime of the query in ISO 8601 format
      required: true
      type: string
    - in: query
      name: end_dt
      description: The end UTC offset-naive datetime of the query in ISO 8601 format. Defaults to current datetime if not provided.
      type: string
    responses:
      "200":
        description: Return a list of topologies belonging to the given network in the given datetime range.
      "400":
        description: Invalid or missing parameters.
    """
    network_name = request.rel_url.query.get("network_name")
    if network_name is None:
        raise web.HTTPBadRequest(text="Missing required 'network_name' param")
    if network_name not in APIServiceClient.network_names():
        raise web.HTTPBadRequest(text=f"Invalid network name: {network_name}")

    start_dt = request.rel_url.query.get("start_dt")
    end_dt = request.rel_url.query.get("end_dt")

    # Parse start_dt, raise '400' if missing/invalid
    if start_dt is None:
        raise web.HTTPBadRequest(text="'start_dt' is missing from query string")

    try:
        start_dt_obj = datetime.fromisoformat(start_dt)
        if start_dt_obj.tzinfo:
            raise web.HTTPBadRequest(
                text="'start_dt' param must be UTC offset-naive datetime"
            )
    except ValueError:
        raise web.HTTPBadRequest(text=f"'start_dt' is invalid ISO 8601: '{start_dt}'")

    # Parse end_dt, use current datetime if not provided. Raise '400' if invalid
    if end_dt is None:
        end_dt_obj = datetime.utcnow()
    else:
        try:
            end_dt_obj = datetime.fromisoformat(end_dt)
            if end_dt_obj.tzinfo:
                raise web.HTTPBadRequest(
                    text="'end_dt' param must be UTC offset-naive datetime"
                )
        except ValueError:
            raise web.HTTPBadRequest(text=f"'end_dt' is invalid ISO 8601: '{end_dt}'")

    query = select([TopologyHistory.topology, TopologyHistory.last_updated]).where(
        (TopologyHistory.network_name == network_name)
        & (TopologyHistory.last_updated >= start_dt_obj)
        & (TopologyHistory.last_updated <= end_dt_obj)
    )

    async with MySQLClient().lease() as sa_conn:
        cursor = await sa_conn.execute(query)
        return web.json_response(
            {"topologies": [dict(row) for row in await cursor.fetchall()]},
            dumps=partial(json.dumps, default=custom_serializer),
        )
