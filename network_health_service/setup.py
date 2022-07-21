#!/usr/bin/env python3

# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

from setuptools import find_packages, setup


ptr_params = {
    "entry_point_module": "network_health_service/main",
    "test_suite": "tests.base",
    "test_suite_timeout": 300,
    "required_coverage": {
        "network_health_service/stats/fetch_stats.py": 97,
        "network_health_service/stats/health.py": 100,
        "network_health_service/stats/metrics.py": 100,
        "TOTAL": 75,
    },
    "run_flake8": True,
    "run_black": True,
    "run_mypy": True,
}

setup(
    name="network_health_service",
    version="2021.06.17",
    packages=find_packages(exclude=["tests"]),
    python_requires=">=3.7",
    install_requires=["aiohttp", "aiomysql", "alembic>=1.3.3,<2.0", "sqlalchemy"],
    extras_require={
        "ci": ["ptr", "asynctest>=0.13.0,<1.0"],
        "docs": ["aiohttp-swagger>=1.0.9,<2.0"],
    },
    test_suite=ptr_params["test_suite"],
    entry_points={
        "console_scripts": ["network_health_service = network_health_service.main:main"]
    },
)
