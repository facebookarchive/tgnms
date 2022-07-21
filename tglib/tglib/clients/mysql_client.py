#!/usr/bin/env python3

# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import os
from typing import Any, Dict, Optional

import aiomysql
from aiomysql.sa import Engine, create_engine
from sqlalchemy import exc, select

from ..exceptions import (
    ClientRestartError,
    ClientRuntimeError,
    ClientStoppedError,
    ConfigError,
)
from .base_client import BaseClient


class MySQLClient(BaseClient):
    """A client for interacting with MySQL using :mod:`sqlalchemy`."""

    _engine: Optional[Engine] = None

    @classmethod
    async def start(cls, config: Dict[str, Any]) -> None:
        """Initialize the MySQL connection pool.

        Args:
            config: Params and values for configuring the client.

        Raises:
            ClientRestartError: The MySQL connection pool has already been initialized.
            ClientRuntimeError: The client failed to connect to the database.
            ConfigError: The ``config`` argument is incorrect/incomplete.
        """
        if cls._engine is not None:
            raise ClientRestartError()

        mysql_params = config.get("mysql")
        required_params = ["host", "port"]

        if mysql_params is None:
            raise ConfigError("Missing required 'mysql' key")
        if not isinstance(mysql_params, dict):
            raise ConfigError("Value for 'mysql' is not an object")
        if not all(param in mysql_params for param in required_params):
            raise ConfigError(f"Missing one or more required params: {required_params}")

        mysql_params.update(
            {
                "db": os.getenv("DB_NAME"),
                "user": os.getenv("DB_USER"),
                "password": os.getenv("DB_PASSWORD"),
            }
        )

        try:
            cls._engine = await create_engine(**mysql_params, pool_recycle=10)
        except aiomysql.OperationalError as e:
            raise ClientRuntimeError() from e

    @classmethod
    async def stop(cls) -> None:
        """Cleanly shut down the MySQL connection pool."""
        if cls._engine is None:
            raise ClientStoppedError()

        cls._engine.close()
        await cls._engine.wait_closed()
        cls._engine = None

    @classmethod
    async def healthcheck(cls) -> bool:
        """Ping the database with a 'SELECT 1' query.

        Returns:
            True if the database connection is alive, False otherwise.
        """
        if cls._engine is None:
            return False

        try:
            async with cls._engine.acquire() as sa_conn:
                await sa_conn.scalar(select([1]))

            return True
        except exc.DBAPIError:
            return False

    def lease(self):
        """Get a connection from the connection pool.

        Attention:
            This function **MUST** be used with an asynchronous context manager.

        Example:
            >>> from sqlalchemy import insert
            >>> async with MySQLClient().lease() as sa_conn:
            ...     query = insert(Table).values(name="test")
            ...     await sa_conn.execute(query)
            ...     await sa_conn.connection.commit()
        """
        if self._engine is None:
            raise ClientStoppedError()

        return self._engine.acquire()
