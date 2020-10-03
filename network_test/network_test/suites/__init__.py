#!/usr/bin/env python3
# Copyright 2004-present Facebook. All Rights Reserved.

__all__ = ["BaseTest", "LinkTest", "NodeTest"]

from typing import Any, Dict, List

from .base import BaseTest
from .link import LinkTest
from .node import NodeTest
from .parallel import ParallelTest
from .sequential import SequentialTest
from ..models import NetworkTestType


class ParallelLinkTest(LinkTest, ParallelTest):
    def __init__(
        self, network_name: str, iperf_options: Dict[str, Any], whitelist: List[str]
    ) -> None:
        test_type = NetworkTestType.PARALLEL_LINK
        super().__init__(network_name, test_type, iperf_options, whitelist)


class ParallelNodeTest(NodeTest, ParallelTest):
    def __init__(
        self, network_name: str, iperf_options: Dict[str, Any], whitelist: List[str]
    ) -> None:
        test_type = NetworkTestType.PARALLEL_NODE
        super().__init__(network_name, test_type, iperf_options, whitelist)


class SequentialLinkTest(LinkTest, SequentialTest):
    def __init__(
        self, network_name: str, iperf_options: Dict[str, Any], whitelist: List[str]
    ) -> None:
        test_type = NetworkTestType.SEQUENTIAL_LINK
        super().__init__(network_name, test_type, iperf_options, whitelist)


class SequentialNodeTest(NodeTest, SequentialTest):
    def __init__(
        self, network_name: str, iperf_options: Dict[str, Any], whitelist: List[str]
    ) -> None:
        test_type = NetworkTestType.SEQUENTIAL_NODE
        super().__init__(network_name, test_type, iperf_options, whitelist)
