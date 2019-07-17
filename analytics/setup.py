#!/usr/bin/env python3
# Copyright 2004-present Facebook. All Rights Reserved.

from setuptools import setup


setup(
    name="analytics",
    version="2019.7.17",
    python_requires=">=3.7",
    packages=[
        "link_insights",
        "module",
        "tests",
        "network_test_api",
        "network_test_api/api",
        "network_test_api/api/migrations",
        "network_test_api/api/network_test",
        "network_test_api/nmsapi",
        "network_scan",
    ],
    package_data={"module": ["AnalyticsConfig.json"], "tests": ["auto_test.sh"]},
    include_package_data=True,
    install_requires=[
        "aiohttp==3.5.4",
        "aiomysql==0.0.20",
        "click==7.0",
        "django==2.1.1",
        "flask==1.0.2",
        "jupyter==1.0.0",
        "matplotlib==2.2.2",
        "mysqlclient==1.3.13",
        "numpy==1.14.5",
        "pymysql==0.9.2",
        "python-snappy==0.5.4",
        "requests==2.19.1",
        "sqlalchemy==1.3.5",
        "tabulate==0.8.3",
    ],
    # TODO: Add unit tests
    # test_suite="analytics.tests.base",
)
