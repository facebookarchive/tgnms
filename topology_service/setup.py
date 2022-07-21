#!/usr/bin/env python3

# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

from setuptools import find_packages, setup


ptr_params = {
    "entry_point_module": "topology_service/main",
    "test_suite": "tests.base",
    "test_suite_timeout": 600,
    "required_coverage": {"topology_service/utils.py": 100, "TOTAL": 7},
    "run_flake8": True,
    "run_black": True,
    "run_mypy": True,
}

setup(
    name="topology_service",
    version="2020.11.17",
    packages=find_packages(exclude=["tests"]),
    install_requires=[
        "aiohttp",
        "alembic>=1.3.3,<2.0",
        "geopy>=1.21.0,<2.0",
        "sqlalchemy",
    ],
    extras_require={"ci": ["ptr"], "docs": ["aiohttp-swagger>=1.0.9,<2.0"]},
    test_suite=ptr_params["test_suite"],
    entry_points={"console_scripts": ["topology_service = topology_service.main:main"]},
)
