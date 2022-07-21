#!/usr/bin/env python3

# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

from setuptools import find_packages, setup


ptr_params = {
    "entry_point_module": "analytics/main",
    "test_suite": "tests.base",
    "test_suite_timeout": 300,
    "required_coverage": {
        "analytics/link_insight.py": 34,
        "analytics/visibility.py": 39,
        "analytics/utils/topology.py": 55,
        "TOTAL": 29,
    },
    "run_flake8": True,
    "run_black": True,
    "run_mypy": True,
}

setup(
    name="analytics",
    version="2022.05.24",
    packages=find_packages(exclude=["tests"]),
    python_requires=">=3.7",
    install_requires=["numpy>=1.16.4,<2.0"],
    extras_require={"ci": ["ptr"], "docs": ["aiohttp-swagger>=1.0.9,<2.0"]},
    test_suite=ptr_params["test_suite"],
    entry_points={"console_scripts": ["analytics = analytics.main:main"]},
)
