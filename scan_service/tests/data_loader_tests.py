#!/usr/bin/env python3

# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import json
import unittest
from unittest.mock import Mock

from scan_service.utils.data_loader import (
    aggregate_all_responses,
    aggregate_current_responses,
    average_rx_responses,
)
from scan_service.utils.hardware_config import HardwareConfig
from terragraph_thrift.Controller.ttypes import ScanFwStatus


class DataLoaderTests(unittest.TestCase):
    def setUp(self) -> None:
        with open("tests/hardware_config.json") as f:
            hardware_config = json.load(f)
            HardwareConfig.set_config(hardware_config)

    def test_aggregate_current_responses_no_input(self) -> None:
        responses = {}
        curr_stats, to_db = aggregate_current_responses(responses, "node_A")
        self.assertDictEqual(curr_stats, {})
        self.assertListEqual(to_db, [])

    def test_aggregate_current_responses(self) -> None:
        responses = {
            "node_A": {
                "status": ScanFwStatus.COMPLETE,
                "txPwrIndex": 7,
                "routeInfoList": [
                    {"route": {"tx": 0, "rx": 0}, "snrEst": 30},
                    {"route": {"tx": 0, "rx": 2}, "snrEst": 20},
                ],
            },
            "node_B": {
                "status": ScanFwStatus.COMPLETE,
                "routeInfoList": [
                    {"route": {"tx": 0, "rx": 0}, "snrEst": 40},
                    {"route": {"tx": 0, "rx": 2}, "snrEst": 10},
                ],
            },
        }
        expected_curr_stats = {
            "node_A": {
                "0_0": {"count": 1, "snr_sum": 30},
                "0_2": {"count": 1, "snr_sum": 20},
            },
            "node_B": {
                "0_0": {"count": 1, "snr_sum": 40},
                "0_2": {"count": 1, "snr_sum": 10},
            },
        }
        expected_to_db = [
            {
                "tx_node": "node_A",
                "rx_node": "node_A",
                "stats": {
                    "0_0": {"count": 1, "snr_sum": 30},
                    "0_2": {"count": 1, "snr_sum": 20},
                },
            },
            {
                "tx_node": "node_A",
                "rx_node": "node_B",
                "stats": {
                    "0_0": {"count": 1, "snr_sum": 40},
                    "0_2": {"count": 1, "snr_sum": 10},
                },
            },
        ]
        curr_stats, to_db = aggregate_current_responses(responses, "node_A")
        self.assertDictEqual(curr_stats, expected_curr_stats)
        self.assertListEqual(to_db, expected_to_db)

    def test_aggregate_all_responses_no_previous_rx_responses(self) -> None:
        previous_rx_responses = []
        curr_stats = {
            "node_A": {
                "0_0": {"count": 1, "snr_sum": 30},
                "0_2": {"count": 1, "snr_sum": 20},
            },
            "node_B": {
                "0_0": {"count": 1, "snr_sum": 40},
                "0_2": {"count": 1, "snr_sum": 10},
            },
        }
        aggregated_stats = aggregate_all_responses(previous_rx_responses, curr_stats)
        self.assertDictEqual(aggregated_stats, curr_stats)

    def test_aggregate_all_responses(self) -> None:
        previous_rx_responses = [
            Mock(
                rx_node="node_A",
                stats={
                    "0_0": {"count": 1, "snr_sum": 30},
                    "0_2": {"count": 1, "snr_sum": 20},
                },
            ),
            Mock(
                rx_node="node_B",
                stats={
                    "0_0": {"count": 1, "snr_sum": 40},
                    "0_2": {"count": 1, "snr_sum": 10},
                },
            ),
        ]
        curr_stats = {
            "node_A": {
                "0_0": {"count": 1, "snr_sum": 30},
                "0_2": {"count": 1, "snr_sum": 20},
            },
            "node_B": {
                "0_0": {"count": 1, "snr_sum": 40},
                "0_2": {"count": 1, "snr_sum": 10},
            },
        }
        expected_aggregated_stats = {
            "node_A": {
                "0_0": {"count": 2, "snr_sum": 60},
                "0_2": {"count": 2, "snr_sum": 40},
            },
            "node_B": {
                "0_0": {"count": 2, "snr_sum": 80},
                "0_2": {"count": 2, "snr_sum": 20},
            },
        }
        aggregated_stats = aggregate_all_responses(previous_rx_responses, curr_stats)
        self.assertDictEqual(aggregated_stats, expected_aggregated_stats)

    def test_average_rx_responses_no_input(self) -> None:
        stats = {}
        averaged_stats = average_rx_responses(stats)
        self.assertDictEqual(averaged_stats, {})

    def test_average_rx_responses(self) -> None:
        stats = {
            "node_A": {
                "0_0": {"count": 2, "snr_sum": 60},
                "0_2": {"count": 2, "snr_sum": 40},
            },
            "node_B": {
                "0_0": {"count": 2, "snr_sum": 80},
                "0_2": {"count": 2, "snr_sum": 20},
            },
        }
        expected_averaged_stats = {
            "node_A": {"0_0": {"snr_avg": 30}, "0_2": {"snr_avg": 20}},
            "node_B": {"0_0": {"snr_avg": 40}, "0_2": {"snr_avg": 10}},
        }
        averaged_stats = average_rx_responses(stats)
        self.assertDictEqual(averaged_stats, expected_averaged_stats)
