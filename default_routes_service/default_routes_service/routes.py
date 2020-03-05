#!/usr/bin/env python3
# Copyright 2004-present Facebook. All Rights Reserved.

import json
import logging
from collections import defaultdict
from datetime import datetime
from functools import partial
from typing import Any, Dict, List, Tuple

from aiohttp import web
from aiomysql.sa.result import RowProxy
from sqlalchemy import literal, select
from tglib.clients import MySQLClient

from .models import DefaultRoutesHistory, LinkCnRoutes


routes = web.RouteTableDef()


def custom_serializer(obj: Any) -> str:
    if isinstance(obj, datetime):
        return datetime.isoformat(obj)
    else:
        return str(obj)


def parse_input_params(request: web.Request) -> Tuple[str, datetime, datetime]:
    network_name = request.rel_url.query.get("network_name")
    start_dt = request.rel_url.query.get("start_dt")
    end_dt = request.rel_url.query.get("end_dt")

    # get the network name
    if network_name is None:
        raise web.HTTPBadRequest(text="Missing required 'network_name' param")

    # Parse start_dt, raise '400' if missing/invalid
    if start_dt is None:
        raise web.HTTPBadRequest(text="Missing required 'start_dt' param")
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
            raise web.HTTPBadRequest(text="'end_dt' param is not valid ISO 8601")

    if start_dt_obj >= end_dt_obj:
        raise web.HTTPBadRequest(text="'start_dt' must be less than 'end_dt' param")

    return network_name, start_dt_obj, end_dt_obj


@routes.get("/routes/history")
async def handle_get_default_routes_history(request: web.Request) -> web.Response:
    """
    ---
    description: Analyze default routes history for any node/all nodes of the network
    tags:
    - Default Routes Service
    produces:
    - application/json
    parameters:
    - in: query
      name: network_name
      description: Name of the network.
      required: true
      schema:
        type: string
    - in: query
      name: node_name
      description: Name of the node. Will fetch info for all nodes if not specified.
      required: false
      schema:
        type: string
    - in: query
      name: start_dt
      description: The start UTC offset-naive datetime of time window, in ISO 8601 format.
      required: true
      schema:
        type: string
    - in: query
      name: end_dt
      description: The end UTC offset-naive datetime of the query in ISO 8601 format. Defaults to current datetime if not provided.
      required: true
      schema:
        type: string
    responses:
      "200":
        description: Successful operation. Returns analyzed default routes history.
      "400":
        description: Invalid or missing parameters.
    """
    # parse and validate input params
    network_name, start_dt_obj, end_dt_obj = parse_input_params(request)

    # get node name from request query
    node_name = request.rel_url.query.get("node_name")

    select_params = [
        DefaultRoutesHistory.routes,
        DefaultRoutesHistory.last_updated,
        DefaultRoutesHistory.hop_count,
        DefaultRoutesHistory.node_name,
    ]

    # query to fetch all route changes in the given datetime window
    in_qry = select([*select_params, literal(True).label("in_window")]).where(
        (DefaultRoutesHistory.network_name == network_name)
        & (DefaultRoutesHistory.last_updated >= start_dt_obj)
        & (DefaultRoutesHistory.last_updated <= end_dt_obj)
    )

    # query to fetch latest routes before the given datetime window
    out_qry = (
        select([*select_params, literal(False).label("in_window")])
        .where(
            (DefaultRoutesHistory.network_name == network_name)
            & (DefaultRoutesHistory.last_updated < start_dt_obj)
        )
        .order_by(DefaultRoutesHistory.last_updated.desc())
        .group_by(
            DefaultRoutesHistory.routes,
            DefaultRoutesHistory.last_updated,
            DefaultRoutesHistory.hop_count,
            DefaultRoutesHistory.node_name,
        )
    )

    # if node name is provided, fetch info for that specific node
    if node_name is not None:
        in_qry = in_qry.where(DefaultRoutesHistory.node_name == node_name)
        out_qry = out_qry.where(DefaultRoutesHistory.node_name == node_name).limit(1)

    # merge both queries
    query = out_qry.union_all(in_qry)

    logging.debug(
        f"Query to fetch node_name, routes and last_updated from db: {str(query)}"
    )

    async with MySQLClient().lease() as conn:
        cursor = await conn.execute(query)
        results = await cursor.fetchall()

    # iterate over the list of RowProxy objects to track changes in routes.
    routes_history: defaultdict = defaultdict(list)
    for row in results:
        routes_history[row.node_name].append(
            {
                "last_updated": row.last_updated,
                "routes": row.routes,
                "hop_count": row.hop_count,
            }
        )

    return web.json_response(
        {
            "history": routes_history,
            "util": compute_routes_utilization(results, start_dt_obj, end_dt_obj),
        },
        dumps=partial(json.dumps, default=custom_serializer),
    )


def compute_routes_utilization(
    raw_routes_data: List[RowProxy], start_dt: datetime, end_dt: datetime
) -> Dict:
    """
    Iterate over the list of RowProxy objects to calculate the percentage of
    time each route takes for each node.
    input = [
            {
                "node_name": "A",
                "routes": [["X", "Y", "Z"]],
                "prev_routes": [["A", "B", "C"]],
                "last_updated": "datetime"
            },
        ]
    output = {
        "A": {
            "[['A', 'B', 'C']]": 30.00,
            "[['X', 'Y', 'Z']]": 70.00,
        },
    }
    """
    # dictionary to track time for routes of each node
    routes_utilization: Dict[str, Dict] = {}
    # dictionary to track previous routes and last_updated info for each node
    prev_info: Dict = {}
    # total datetime difference requested
    total_time_window: float = (end_dt - start_dt).total_seconds()

    # row data is in ascending order of time
    for row in raw_routes_data:
        node_name = row.node_name
        curr_routes = row.routes
        curr_datetime = row.last_updated

        # initialize the node
        if node_name not in routes_utilization:
            prev_info[node_name] = {
                "routes": curr_routes if not row.in_window else None,
                "datetime": start_dt,
            }
            routes_utilization[node_name] = defaultdict(float)

        # record time taken by the previous routes
        routes_utilization[node_name][str(prev_info[node_name]["routes"])] += (
            curr_datetime - prev_info[node_name]["datetime"]
        ).total_seconds()

        # set the current routes as previous routes for next iteration
        prev_info[node_name]["routes"] = curr_routes
        # set the current datetime as previous datetime for next iteration
        prev_info[node_name]["datetime"] = curr_datetime

    # record the time taken by the last route until end_dt
    for node_name, info in prev_info.items():
        routes_utilization[node_name][str(info["routes"])] += (
            end_dt - info["datetime"]
        ).total_seconds()

    # calculate routes utilization for all routes
    for node_name, routes_info in routes_utilization.items():
        for routes, time in routes_info.items():
            routes_utilization[node_name][routes] = round(
                (time / total_time_window * 100), 3
            )

    return routes_utilization


@routes.get("/routes/cn_routes")
async def handle_get_cn_routes(request: web.Request) -> web.Response:
    """
    ---
    description: Fetch CN default routes history for links.
    tags:
    - Default Routes Service
    produces:
    - application/json
    parameters:
    - in: query
      name: network_name
      description: Name of the network.
      required: true
      schema:
        type: string
    - in: query
      name: link_name
      description: Name of the link. Will fetch info for all links if not specified.
      required: false
      schema:
        type: string
    - in: query
      name: start_dt
      description: The start UTC offset-naive datetime of time window, in ISO 8601 format.
      required: true
      schema:
        type: string
    - in: query
      name: end_dt
      description: The end UTC offset-naive datetime of the query in ISO 8601 format. Defaults to current datetime if not provided.
      required: true
      schema:
        type: string
    responses:
      "200":
        description: Successful operation. Returns CN default routes history for the link.
      "400":
        description: Invalid or missing parameters.
    """

    # parse and validate input params
    network_name, start_dt_obj, end_dt_obj = parse_input_params(request)

    # get link name from request query
    link_name = request.rel_url.query.get("link_name")

    # get entries for all links between start and end time
    query = select(
        [
            LinkCnRoutes.network_name,
            LinkCnRoutes.link_name,
            LinkCnRoutes.last_updated,
            LinkCnRoutes.cn_routes,
        ]
    ).where(
        (LinkCnRoutes.network_name == network_name)
        & (LinkCnRoutes.last_updated >= start_dt_obj)
        & (LinkCnRoutes.last_updated <= end_dt_obj)
    )

    # if link name is provided, fetch info for that specific link
    if link_name is not None:
        query = query.where(LinkCnRoutes.link_name == link_name)

    logging.debug(
        f"Query to fetch link_name, cn_routes and last_updated from db: {str(query)}"
    )

    async with MySQLClient().lease() as conn:
        cursor = await conn.execute(query)
        return web.json_response(
            [dict(row) for row in await cursor.fetchall()],
            dumps=partial(json.dumps, default=custom_serializer),
        )
