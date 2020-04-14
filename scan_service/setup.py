#!/usr/bin/env python3
# Copyright 2004-present Facebook. All Rights Reserved.

from setuptools import find_packages, setup


ptr_params = {
    "entry_point_module": "scan_service/main",
    "test_suite": "tests.base",
    "test_suite_timeout": 600,
    "run_flake8": True,
    "run_black": True,
    "run_mypy": True,
}

setup(
    name="scan_service",
    version="2020.04.07",
    python_requires=">=3.7",
    packages=find_packages(exclude=["tests"]),
    extras_require={"ci": ["ptr"], "docs": ["aiohttp-swagger>=1.0.9,<2.0"]},
    test_suite=ptr_params["test_suite"],
    entry_points={"console_scripts": ["scan_service = scan_service.main:main"]},
)
