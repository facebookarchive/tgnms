#!/usr/bin/env python3
# Copyright 2004-present Facebook. All Rights Reserved.

import asyncio
import logging
import time
from contextlib import suppress
from datetime import datetime
from typing import Dict, Iterable, NoReturn, Optional

from croniter import croniter
from sqlalchemy import delete, exists, insert, join, select, update
from tglib.clients import APIServiceClient, MySQLClient
from tglib.exceptions import ClientRuntimeError

from .models import (
    NetworkTestExecution,
    NetworkTestParams,
    NetworkTestSchedule,
    NetworkTestStatus,
    NetworkTestType,
)
from .suites import BaseTest, MultihopTest, ParallelTest, SequentialTest


class Schedule:
    def __init__(self, enabled: bool, cron_expr: str) -> None:
        self.enabled = enabled
        self.cron_expr = cron_expr
        self.task: Optional[asyncio.Task] = None

    async def start(
        self, test: BaseTest, test_type: NetworkTestType, params_id: int
    ) -> NoReturn:
        iter = croniter(self.cron_expr, datetime.now())

        while True:
            logging.info(
                f"A {test_type.value} test is scheduled for "
                f"{iter.get_next(datetime)} on {test.network_name}"
            )

            # Sleep until it is time to run
            await asyncio.sleep(iter.get_current() - time.time())

            # Skip if the schedule is disabled
            if not self.enabled:
                logging.info("Schedule is currently disabled, skipping...")
                continue

            # Start the test if the network is unoccupied
            if await Scheduler.is_network_busy(test.network_name):
                logging.warning(f"A test is already running on {test.network_name}")
            else:
                await Scheduler.start_execution(test, test_type, params_id)

    async def stop(self) -> bool:
        # Cancel the task
        if self.task is None or not self.task.cancel():
            return False

        with suppress(asyncio.CancelledError):
            await self.task

        return True


class Scheduler:
    _schedules: Dict[int, Schedule] = {}
    _executions: Dict[int, BaseTest] = {}

    @classmethod
    def has_schedule(cls, schedule_id: int) -> bool:
        return schedule_id in cls._schedules

    @classmethod
    def has_execution(cls, execution_id: int) -> bool:
        return execution_id in cls._executions

    @classmethod
    async def restart(cls) -> None:
        # Stop all stale running tests
        try:
            client = APIServiceClient(timeout=1)
            statuses = await client.request_all("statusTraffic")
            for network_name, sessions in statuses.items():
                sessions = sessions.get("sessions")
                if sessions is None:
                    continue

                tasks = [
                    client.request(network_name, "stopTraffic", params={"id": id})
                    for id in sessions
                ]

                await asyncio.gather(*tasks)
        except ClientRuntimeError as e:
            logging.error(f"Failed to stop one or more iperf session(s): {str(e)}")

        # Mark all stale running tests as ABORTED in the DB
        async with MySQLClient().lease() as sa_conn:
            query = (
                update(NetworkTestExecution)
                .values(status=NetworkTestStatus.ABORTED)
                .where(NetworkTestExecution.status == NetworkTestStatus.RUNNING)
            )

            await sa_conn.execute(query)
            await sa_conn.connection.commit()

        # Start all of the schedules in the DB
        for result in await cls.list_schedules():
            schedule = Schedule(result.enabled, result.cron_expr)

            test: BaseTest
            if result.test_type == NetworkTestType.MULTIHOP_TEST:
                test = MultihopTest(result.network_name, result.iperf_options)
            elif result.test_type == NetworkTestType.PARALLEL_LINK_TEST:
                test = ParallelTest(result.network_name, result.iperf_options)
            elif result.test_type == NetworkTestType.SEQUENTIAL_LINK_TEST:
                test = SequentialTest(result.network_name, result.iperf_options)

            cls._schedules[result.id] = schedule
            schedule.task = asyncio.create_task(
                schedule.start(test, result.test_type, result.params_id)
            )

    @classmethod
    async def add_schedule(
        cls, schedule: Schedule, test: BaseTest, test_type: NetworkTestType
    ) -> int:
        async with MySQLClient().lease() as sa_conn:
            insert_schedule_query = insert(NetworkTestSchedule).values(
                enabled=schedule.enabled, cron_expr=schedule.cron_expr
            )

            schedule_row = await sa_conn.execute(insert_schedule_query)
            schedule_id = schedule_row.lastrowid

            insert_params_query = insert(NetworkTestParams).values(
                schedule_id=schedule_id,
                test_type=test_type,
                network_name=test.network_name,
                iperf_options=test.iperf_options,
            )

            params_row = await sa_conn.execute(insert_params_query)
            params_id = params_row.lastrowid

            await sa_conn.connection.commit()

        cls._schedules[schedule_id] = schedule
        schedule.task = asyncio.create_task(schedule.start(test, test_type, params_id))
        return schedule_id

    @classmethod
    async def modify_schedule(
        cls,
        schedule_id: int,
        schedule: Schedule,
        test: BaseTest,
        test_type: NetworkTestType,
    ) -> bool:
        old_schedule = cls._schedules[schedule_id]
        if not await old_schedule.stop():
            return False

        async with MySQLClient().lease() as sa_conn:
            update_schedule_query = (
                update(NetworkTestSchedule)
                .where(NetworkTestSchedule.id == schedule_id)
                .values(enabled=schedule.enabled, cron_expr=schedule.cron_expr)
            )

            await sa_conn.execute(update_schedule_query)

            get_params_query = (
                select([NetworkTestParams])
                .where(NetworkTestParams.schedule_id == schedule_id)
                .order_by(NetworkTestParams.id.desc())
                .limit(1)
            )

            cursor = await sa_conn.execute(get_params_query)
            params_row = await cursor.first()
            params_id = params_row.id

            if not (
                params_row.test_type == test_type
                and params_row.network_name == test.network_name
                and params_row.iperf_options == test.iperf_options
            ):
                insert_params_query = insert(NetworkTestParams).values(
                    schedule_id=schedule_id,
                    test_type=test_type,
                    network_name=test.network_name,
                    iperf_options=test.iperf_options,
                )

                params_row = await sa_conn.execute(insert_params_query)
                params_id = params_row.lastrowid

            await sa_conn.connection.commit()

        cls._schedules[schedule_id] = schedule
        schedule.task = asyncio.create_task(schedule.start(test, test_type, params_id))
        return True

    @classmethod
    async def delete_schedule(cls, schedule_id: int) -> bool:
        schedule = cls._schedules[schedule_id]
        if not await schedule.stop():
            return False

        async with MySQLClient().lease() as sa_conn:
            query = delete(NetworkTestSchedule).where(
                NetworkTestSchedule.id == schedule_id
            )

            await sa_conn.execute(query)
            await sa_conn.connection.commit()

        del cls._schedules[schedule_id]
        return True

    @classmethod
    async def start_execution(
        cls, test: BaseTest, test_type: NetworkTestType, params_id: Optional[int] = None
    ) -> int:
        async with MySQLClient().lease() as sa_conn:
            if params_id is None:
                insert_params_query = insert(NetworkTestParams).values(
                    test_type=test_type,
                    network_name=test.network_name,
                    iperf_options=test.iperf_options,
                )

                params_row = await sa_conn.execute(insert_params_query)
                params_id = params_row.lastrowid

            insert_execution_query = insert(NetworkTestExecution).values(
                params_id=params_id, status=NetworkTestStatus.RUNNING
            )

            execution_row = await sa_conn.execute(insert_execution_query)
            execution_id = execution_row.lastrowid
            await sa_conn.connection.commit()

        cls._executions[execution_id] = test
        test.task = asyncio.create_task(test.start())
        return execution_id

    @classmethod
    async def stop_execution(cls, execution_id: int) -> bool:
        test = cls._executions[execution_id]
        if not await test.stop():
            return False

        async with MySQLClient().lease() as sa_conn:
            query = (
                update(NetworkTestExecution)
                .where(NetworkTestExecution.id == execution_id)
                .values(status=NetworkTestStatus.ABORTED)
            )

            await sa_conn.execute(query)
            await sa_conn.connection.commit()

        del cls._executions[execution_id]
        return True

    @staticmethod
    async def list_schedules(schedule_id: Optional[int] = None) -> Iterable:
        async with MySQLClient().lease() as sa_conn:
            query = (
                select(
                    [
                        NetworkTestSchedule,
                        NetworkTestParams.id.label("params_id"),
                        NetworkTestParams.test_type,
                        NetworkTestParams.network_name,
                        NetworkTestParams.iperf_options,
                    ]
                )
                .select_from(
                    join(
                        NetworkTestParams,
                        NetworkTestSchedule,
                        NetworkTestParams.schedule_id == NetworkTestSchedule.id,
                    )
                )
                .order_by(NetworkTestParams.id.desc())
                .limit(1)
            )

            if schedule_id is None:
                cursor = await sa_conn.execute(query)
                return await cursor.fetchall()
            else:
                query = query.where(NetworkTestSchedule.id == schedule_id)
                cursor = await sa_conn.execute(query)
                return await cursor.first()

    @staticmethod
    async def list_executions(execution_id: Optional[int] = None) -> Iterable:
        async with MySQLClient().lease() as sa_conn:
            query = select(
                [
                    NetworkTestExecution,
                    NetworkTestParams.test_type,
                    NetworkTestParams.network_name,
                    NetworkTestParams.iperf_options,
                ]
            ).select_from(
                join(
                    NetworkTestExecution,
                    NetworkTestParams,
                    NetworkTestExecution.params_id == NetworkTestParams.id,
                )
            )

            if execution_id is None:
                cursor = await sa_conn.execute(query)
                return await cursor.fetchall()
            else:
                query = query.where(NetworkTestExecution.id == execution_id)
                cursor = await sa_conn.execute(query)
                return await cursor.first()

    @staticmethod
    async def is_network_busy(network_name: str) -> bool:
        async with MySQLClient().lease() as sa_conn:
            query = select(
                [
                    exists()
                    .where(
                        (NetworkTestExecution.status == NetworkTestStatus.RUNNING)
                        & (NetworkTestParams.network_name == network_name)
                    )
                    .select_from(
                        join(
                            NetworkTestExecution,
                            NetworkTestParams,
                            NetworkTestExecution.params_id == NetworkTestParams.id,
                        )
                    )
                ]
            )

            cursor = await sa_conn.execute(query)
            return await cursor.scalar()
