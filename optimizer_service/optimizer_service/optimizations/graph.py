#!/usr/bin/env python3

# Copyright (c) Meta Platforms, Inc. and affiliates.
#
# This source code is licensed under the MIT license found in the
# LICENSE file in the root directory of this source tree.

import logging
from typing import Dict, List, Set, Tuple

import networkx as nx
from terragraph_thrift.Topology.ttypes import LinkType, NodeType

from .flow_graph import FlowGraph


def build_topology_graph(topology: Dict) -> Tuple[nx.Graph, Set[str]]:
    graph = nx.Graph()
    nodes = []
    edges = []
    cns: Set[str] = set()
    for node in topology["nodes"]:
        nodes.append((node["name"], node))
        # Connecting all PoP nodes to a common 'source' since PoP-PoP connections
        # are not in the topology
        if node["pop_node"] and node["is_primary"]:
            edges.append(
                ("source", node["name"], {"name": "link-source-" + node["name"]})
            )
        if node["node_type"] == NodeType.CN:
            cns.add(node["name"])

    for link in topology["links"]:
        edges.append((link["a_node_name"], link["z_node_name"], link))
    graph.add_nodes_from(nodes)
    graph.add_edges_from(edges)
    logging.debug(
        f"Created graph with {len(graph.nodes)} nodes, {len(graph.edges)} "
        f'edges and {len(cns)} CNs for {topology["name"]}'
    )
    return graph, cns


def find_cn_cut_edges(graph: nx.Graph, cns: Set[str]) -> Set[Tuple[str, str]]:
    # Check if topology has unconnected nodes so they don't affect cut-edge analysis
    topology_components = list(nx.connected_components(graph))
    logging.debug(f"Number of connected components {len(topology_components)}")
    if len(topology_components) > 1:
        logging.warning("Topology already has some unconnected nodes")

    pops = {node for node in graph["source"]}
    # Mapping from cut-edge to the CNs it cuts off, if any
    cn_cut_edges = set()
    for a_node, z_node in nx.bridges(graph):
        link_attributes = graph.get_edge_data(a_node, z_node)
        # Skip wired links
        if link_attributes.get("link_type") == LinkType.WIRELESS:
            logging.debug(f"Analyzing cut edge between {a_node} and {z_node}")
            if is_cn_cut_edge(graph, a_node, z_node, cns, pops, topology_components):
                cn_cut_edges.add((a_node, z_node))
    return cn_cut_edges


def is_cn_cut_edge(
    graph: nx.Graph,
    a_node: str,
    z_node: str,
    cns: Set[str],
    pops: Set[str],
    topology_components: List[Set[str]],
) -> bool:
    # If the edge is a CN-DN edge then it is a CN cut edge
    cut_cns = set((a_node, z_node)) & cns
    if cut_cns:
        logging.debug(f"Cut edge between {a_node} and {z_node} cuts off CN {cut_cns}")
        return True
    # For non-CN cut edges check if removing the link cuts off a CN from PoPs
    graph.remove_edge(a_node, z_node)
    connected_components = nx.connected_components(graph)
    # If removing the edge has created a graph component that has no PoPs but has CNs
    # then it is a CN cut edge
    for component in connected_components:
        # If this component isn't already disconnected in the original topology
        # i.e. it has been created by removing the edge
        if component not in topology_components:
            if not (component & pops):
                cut_cns = component & cns
                if cut_cns:
                    logging.debug(
                        f"Cut edge between {a_node} and {z_node} cuts off CNs {cut_cns}"
                    )
                    # the edge is added back to the graph with out link attributes.
                    graph.add_edge(a_node, z_node)
                    return True
    graph.add_edge(a_node, z_node)
    return False


def remove_low_uptime_links(
    graph: nx.Graph, active_links: Dict, link_uptime_threshold: float
) -> None:
    """Removes links with an average uptime below 'link_uptime_threshold' from 'graph'."""
    for edge in graph.edges:
        link_attributes = graph.get_edge_data(*edge)
        link_name = link_attributes.get("name")
        uptime = active_links.get(link_name, 0)
        if uptime < link_uptime_threshold:
            logging.debug(
                f"Removing {link_name}: Uptime ({uptime}) is less than {link_uptime_threshold}."
            )
            graph.remove_edge(*edge)


def find_all_p2mp(graph: nx.Graph) -> Dict:
    """Find all nodes that have more than one wireless links."""
    p2mp_nodes = {}
    for node in graph.nodes:
        wl_links = []
        links = graph.edges(node)
        for link in links:
            link_data = graph.get_edge_data(*link)
            if link_data.get("link_type") == LinkType.WIRELESS:
                wl_links.append(link_data)
        if len(wl_links) > 1:
            p2mp_nodes[node] = wl_links
            logging.debug(f"node name: {node}, num wireless links: {len(wl_links)}")
    return p2mp_nodes


def estimate_capacity(
    graph: nx.Graph,
    cns: Set[str],
    wireless_capacity_mbps: int,
    wired_capacity_mbps: int,
) -> FlowGraph:
    """Estimate the maximum simultaneous throughput to all CNs."""
    flow_graph = FlowGraph()
    sources: Set[str] = set(["source"])
    sinks: Set[str] = set()

    paths = nx.shortest_path(graph, "source")

    # "source" is the source of all flow and has a non-zero net_flow
    flow_graph.add_node("source", net_flow=True)

    # Create flow-graph objects for all nodes and edges on path to a CN
    for cn in cns:
        if cn not in paths:
            continue

        sinks.add(cn)
        flow_graph.add_node(cn, net_flow=True)
        path = paths[cn]
        for i in range(len(path) - 1):
            tx_node = path[i]
            rx_node = path[i + 1]
            flow_graph.add_node(tx_node)
            flow_graph.add_node(rx_node)
            link_attr = graph.get_edge_data(tx_node, rx_node)
            # Only wireless links share time with each other
            link_capacity = (
                wireless_capacity_mbps
                if link_attr.get("link_type") == LinkType.WIRELESS
                else wired_capacity_mbps
            )
            flow_graph.add_edge(
                link_capacity,
                tx_node,
                rx_node,
                share_time=(link_attr.get("link_type") == LinkType.WIRELESS),
                name=link_attr.get("name"),
            )

    # Add node constraints
    flow_graph.add_constraints()
    # Find the maximum simultaneously achievable throughput to all CNs
    flow_graph.solve_maximize_min_problem(sources, sinks)
    return flow_graph
