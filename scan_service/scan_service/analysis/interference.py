#!/usr/bin/env python3

# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import asyncio
import logging
from collections import defaultdict
from typing import DefaultDict, Dict, List, Optional

import numpy as np
from terragraph_thrift.Controller.ttypes import ScanMode

from ..utils.hardware_config import HardwareConfig
from ..utils.stats import get_latest_stats
from ..utils.topology import Topology


def get_link_inr(network_name: str, rx_pair_inr: Dict) -> Dict:
    """Fetch the inr in each direction for all links."""
    results: DefaultDict = defaultdict(list)
    for (rx_node, rx_from_node), inr_power in rx_pair_inr.items():
        link_name = Topology.mac_to_link_name.get(network_name, {}).get(
            (rx_node, rx_from_node)
        )
        if link_name is None:
            continue

        inr_db = 10 * np.log10(inr_power)
        if inr_db < HardwareConfig.MINIMUM_SNR_DB:
            continue

        results[link_name].append(
            {"rx_node": rx_node, "rx_from_node": rx_from_node, "inr_curr_power": inr_db}
        )
    return results


def aggregate_interference_results(interference_results: List[Dict]) -> Dict:
    """Aggregate inr for each link direction."""
    if not interference_results:
        return {}

    inr_current_scan: DefaultDict = defaultdict(int)
    inr_n_days_scan: DefaultDict = defaultdict(int)
    for result in interference_results:
        network_name = result["network_name"]
        inr_db = result["inr_curr_power"].get("snr_avg")
        if inr_db is None:
            continue

        if result["is_n_day_avg"]:
            inr_n_days_scan[(result["rx_node"], result["rx_from_node"])] += pow(
                10, inr_db / 10
            )
        else:
            inr_current_scan[(result["rx_node"], result["rx_from_node"])] += pow(
                10, inr_db / 10
            )

    aggregated_results: Dict = {
        "current": get_link_inr(network_name, inr_current_scan),
        "n_day_avg": get_link_inr(network_name, inr_n_days_scan),
    }
    return aggregated_results


def get_interference_data(
    response: Dict[str, Dict], tx_beam: int, rx_beam: int, use_exact_beam: bool = False
) -> Optional[Dict]:
    """Get the INR measurement given a particular tx and rx beam index."""
    tx_idx_left = HardwareConfig.get_adjacent_beam_index(tx_beam, -1)
    tx_idx_right = HardwareConfig.get_adjacent_beam_index(tx_beam, 1)
    rx_idx_left = HardwareConfig.get_adjacent_beam_index(rx_beam, -1)
    rx_idx_right = HardwareConfig.get_adjacent_beam_index(rx_beam, 1)

    key = f"{tx_beam}_{rx_beam}"
    key_up = f"{tx_beam}_{rx_idx_left}"
    key_down = f"{tx_beam}_{rx_idx_right}"
    key_left = f"{tx_idx_left}_{rx_beam}"
    key_right = f"{tx_idx_right}_{rx_beam}"

    if key in response:
        return response[key]
    if not use_exact_beam:
        for key in [key_left, key_right, key_up, key_down]:
            if key in response:
                return response[key]
    logging.debug(f"No measurements at tx_beam {tx_beam} and rx_beam {rx_beam}")
    return None


async def get_interference_from_current_beams(  # noqa: C901
    im_data: Dict, network_name: str, use_real_links: bool
) -> List[Dict]:
    """Process relative IM scan data and compute interference with current beams."""
    result: List = []
    network_name = im_data["network_name"]
    tx_node = im_data["tx_node"]
    logging.info(f"Analyzing interference for {tx_node}")

    tx_infos = await get_latest_stats(network_name, tx_node, ["mcs", "tx_power"])

    for rx_node in im_data["current_avg_rx_responses"]:
        if tx_node == rx_node:
            continue

        # Skip if they map to the same site
        tx_site_name = Topology.wlan_mac_to_site_name.get(network_name, {}).get(tx_node)
        rx_site_name = Topology.wlan_mac_to_site_name.get(network_name, {}).get(rx_node)
        if tx_site_name is not None and rx_site_name is not None:
            if tx_site_name == rx_site_name:
                logging.debug(
                    f"{tx_node} and {rx_node} are radios on the same site."
                    "Skipping interference analysis."
                )
                continue
        else:
            logging.debug(f"Ignoring missing site name for {tx_node} &/or {rx_node}.")

        # Skip if they are the same polarity
        tx_polarity = Topology.node_polarity.get(network_name, {}).get(tx_node)
        rx_polarity = Topology.node_polarity.get(network_name, {}).get(rx_node)
        if tx_polarity is not None and rx_polarity is not None:
            if tx_polarity == rx_polarity:
                logging.debug(
                    f"{tx_node} and {rx_node} have the same polarity."
                    "Skipping interference analysis."
                )
                continue
        else:
            logging.debug(
                f"Ignoring missing polarity info for {tx_node} &/or {rx_node}."
            )

        logging.info(f"Analyzing interference from {tx_node} to {rx_node}")

        # Loop through tx_beam and rx_beam combinations
        for tx_to_node, tx_beam in im_data["relative_im_beams"].items():
            # Skip if it's an actual link
            if rx_node == tx_to_node and not use_real_links:
                continue

            curr_power_idx = tx_infos.get(tx_to_node, {}).get("tx_power")
            if curr_power_idx is not None:
                curr_power_idx = int(curr_power_idx)
            for rx_from_node, rx_beam in im_data["current_avg_rx_responses"][rx_node][
                "relative_im_beams"
            ].items():
                # Skip if it's an actual link
                if rx_from_node == tx_node and not use_real_links:
                    continue

                logging.debug(
                    f"TX to {tx_to_node} from {tx_node} uses tx_beam {tx_beam} and "
                    f"tx_power {curr_power_idx}"
                )
                logging.debug(
                    f"RX for {rx_node} from {rx_from_node} uses rx_beam {rx_beam}"
                )

                inr = get_interference_data(
                    im_data["current_avg_rx_responses"][rx_node],
                    int(tx_beam),
                    int(rx_beam),
                )
                if inr is None:
                    continue

                tx_channel = Topology.node_channel.get(network_name, {}).get(tx_node)
                if tx_channel is not None:
                    tx_channel = str(tx_channel)

                inr_curr_power = {}
                if curr_power_idx is not None:
                    curr_inr_offset = HardwareConfig.get_pwr_offset(
                        target_pwr_idx=curr_power_idx,
                        channel=tx_channel,
                        mcs=tx_infos.get(tx_to_node, {}).get("mcs"),
                    )
                    inr_curr_power = {"snr_avg": inr["snr_avg"] + curr_inr_offset}

                result.append(
                    {
                        "group_id": im_data.get("group_id"),
                        "token": im_data.get("token"),
                        "tx_node": tx_node,
                        "tx_to_node": tx_to_node,
                        "tx_power_idx": curr_power_idx,
                        "rx_node": rx_node,
                        "rx_from_node": rx_from_node,
                        "inr_curr_power": inr_curr_power,
                        "inr_max_power": {"snr_avg": inr["snr_avg"]},
                        "is_n_day_avg": False,
                    }
                )
    logging.info(
        f"{tx_node} caused interference to {len(result)} other nodes "
        "in the current scan."
    )

    return result


async def get_interference_from_directional_beams(  # noqa: C901
    im_data: Dict,
    network_name: str,
    n_days: int,
    use_real_links: bool,
    is_n_day_avg: bool,
) -> List[Dict]:
    """Process fine/coarse IM scan data & compute interference for directional beams."""
    result: List = []
    network_name = im_data["network_name"]
    tx_node = im_data["tx_node"]
    logging.info(f"Analyzing interference for {tx_node}")
    rx_responses = (
        im_data["n_day_avg_rx_responses"]
        if is_n_day_avg
        else im_data["current_avg_rx_responses"]
    )

    tx_infos = await get_latest_stats(
        network_name, tx_node, ["mcs", "tx_beam_idx", "tx_power"]
    )

    coros = []
    rx_nodes = []
    for rx_node in rx_responses:
        # Skip if they are the same
        if tx_node == rx_node:
            continue

        # Skip if they map to the same site
        tx_site_name = Topology.wlan_mac_to_site_name.get(network_name, {}).get(tx_node)
        rx_site_name = Topology.wlan_mac_to_site_name.get(network_name, {}).get(rx_node)
        if tx_site_name is not None and rx_site_name is not None:
            if tx_site_name == rx_site_name:
                logging.debug(
                    f"{tx_node} and {rx_node} are radios on the same site."
                    "Skipping interference analysis."
                )
                continue
        else:
            logging.debug(f"Ignoring missing site name for {tx_node} &/or {rx_node}.")

        # Skip if they are the same polarity
        tx_polarity = Topology.node_polarity.get(network_name, {}).get(tx_node)
        rx_polarity = Topology.node_polarity.get(network_name, {}).get(rx_node)
        if tx_polarity is not None and rx_polarity is not None:
            if tx_polarity == rx_polarity:
                logging.debug(
                    f"{tx_node} and {rx_node} have the same polarity."
                    "Skipping interference analysis."
                )
                continue
        else:
            logging.debug(
                f"Ignoring missing polarity info for {tx_node} &/or {rx_node}."
            )

        logging.info(f"Analyzing interference from {tx_node} to {rx_node}")
        rx_nodes.append(rx_node)
        coros.append(get_latest_stats(network_name, rx_node, ["rx_beam_idx"]))

    for rx_node, rx_infos in zip(rx_nodes, await asyncio.gather(*coros)):
        # Loop through tx_beam and rx_beam combinations
        for tx_to_node, tx_info in tx_infos.items():
            # Skip if it's an actual link
            if rx_node == tx_to_node and not use_real_links:
                continue

            tx_beam = tx_info.get("tx_beam_idx")
            if tx_beam is None:
                continue

            curr_power_idx = tx_info.get("tx_power")
            if curr_power_idx is not None:
                curr_power_idx = int(curr_power_idx)
            for rx_from_node, rx_info in rx_infos.items():
                # Skip if it's an actual link
                if rx_from_node == tx_node and not use_real_links:
                    continue

                rx_beam = rx_info.get("rx_beam_idx")
                if rx_beam is None:
                    continue

                logging.debug(
                    f"TX to {tx_to_node} from {tx_node} uses tx_beam {tx_beam} and "
                    f"tx_power {curr_power_idx}"
                )
                logging.debug(
                    f"RX for {rx_node} from {rx_from_node} uses rx_beam {rx_beam}"
                )

                inr = get_interference_data(
                    rx_responses[rx_node], int(tx_beam), int(rx_beam)
                )
                if inr is None:
                    continue

                tx_channel = Topology.node_channel.get(network_name, {}).get(tx_node)
                if tx_channel is not None:
                    tx_channel = str(tx_channel)

                inr_curr_power = {}
                if curr_power_idx is not None:
                    curr_inr_offset = HardwareConfig.get_pwr_offset(
                        target_pwr_idx=curr_power_idx,
                        channel=tx_channel,
                        mcs=tx_info.get("mcs"),
                    )
                    inr_curr_power = {"snr_avg": inr["snr_avg"] + curr_inr_offset}

                result.append(
                    {
                        "group_id": im_data.get("group_id"),
                        "token": im_data.get("token"),
                        "tx_node": tx_node,
                        "tx_to_node": tx_to_node,
                        "tx_power_idx": curr_power_idx,
                        "rx_node": rx_node,
                        "rx_from_node": rx_from_node,
                        "inr_curr_power": inr_curr_power,
                        "inr_max_power": {"snr_avg": inr["snr_avg"]},
                        "is_n_day_avg": is_n_day_avg,
                    }
                )
    logging.info(
        (
            f"{tx_node} caused interference to {len(result)} other nodes "
            f"over scans from last {n_days} days."
        )
        if is_n_day_avg
        else (
            f"{tx_node} caused interference to {len(result)} other nodes "
            "in the current scan."
        )
    )

    return result


async def analyze_interference(
    im_data: Optional[Dict], network_name: str, n_days: int, use_real_links: bool
) -> Optional[List[Dict]]:
    """Derive interference based on current topology."""
    if im_data is None:
        return None

    if im_data["mode"] == ScanMode.RELATIVE:
        return await get_interference_from_current_beams(
            im_data, network_name, use_real_links
        )
    elif im_data["mode"] == ScanMode.FINE or im_data["mode"] == ScanMode.COARSE:
        current_interference_data = await get_interference_from_directional_beams(
            im_data, network_name, n_days, use_real_links, False
        )
        n_days_interference_data = await get_interference_from_directional_beams(
            im_data, network_name, n_days, use_real_links, True
        )
        return current_interference_data + n_days_interference_data
    logging.info(f"Unsupported ScanMode {im_data['mode']} for interference analysis")
    return None
