#!/usr/bin/env python3

# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

from sys import version_info

from setuptools import setup


assert version_info >= (3, 6, 0), "docker-v6up.py requires >= Python 3.6"
# Pin docker to 4.4.4 b/c of https://github.com/docker/docker-py/issues/2807
INSTALL_REQUIRES = ["click", "docker==4.4.4", "nsenter"]


setup(
    name="docker_v6up",
    version="1.0.0",
    description=("force v6 on when docker containers come up"),
    py_modules=["docker_v6up"],
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3 :: Only",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Development Status :: 3 - Alpha",
    ],
    python_requires=">=3.6",
    install_requires=INSTALL_REQUIRES,
    entry_points={"console_scripts": ["v6up = docker_v6up:main"]},
)
