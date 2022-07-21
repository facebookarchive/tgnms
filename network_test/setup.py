#!/usr/bin/env python3

# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

from setuptools import find_packages, setup


ptr_params = {
    "entry_point_module": "network_test/main",
    "test_suite_timeout": 300,
    "run_flake8": True,
    "run_black": True,
    "run_mypy": True,
}

setup(
    name="network_test",
    version="2021.11.04",
    packages=find_packages(),
    python_requires=">=3.7",
    install_requires=[
        "aiohttp",
        "alembic>=1.3.3,<2.0",
        "croniter>=0.3.30,<1.0",
        "sqlalchemy",
    ],
    extras_require={"ci": ["ptr"], "docs": ["aiohttp-swagger>=1.0.9,<2.0"]},
    entry_points={"console_scripts": ["network_test = network_test.main:main"]},
)
