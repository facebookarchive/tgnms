#!/usr/bin/env python3
# Copyright 2004-present Facebook. All Rights Reserved.

from setuptools import find_packages, setup


ptr_params = {
    "entry_point_module": "network_test/main",
    "test_suite": "tests.base",
    "test_suite_timeout": 300,
    "run_flake8": True,
    "run_black": True,
    "run_mypy": True,
}

setup(
    name="network_test",
    version="2020.04.09",
    packages=find_packages(exclude=["tests"]),
    python_requires=">=3.7",
    install_requires=[
        "aiohttp",
        "alembic>=1.3.3,<2.0",
        "croniter>=0.3.30,<1.0",
        "sqlalchemy",
    ],
    extras_require={"ci": ["ptr"]},
    entry_points={"console_scripts": ["network_test = network_test.main:main"]},
)
