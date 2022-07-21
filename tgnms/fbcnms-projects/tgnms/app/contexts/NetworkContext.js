/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import React from 'react';
import {TOPOLOGY_ELEMENT} from '@fbcnms/tg-nms/app/constants/NetworkConstants';
import type {HardwareProfiles} from '@fbcnms/tg-nms/shared/dto/HardwareProfiles';
import type {
  LinkType,
  LocationType,
  NodeType,
} from '@fbcnms/tg-nms/shared/types/Topology';
import type {
  NetworkAnalyzerData,
  NetworkHealth,
  NetworkState,
} from '@fbcnms/tg-nms/shared/dto/NetworkState';

export type NetworkConfig = NetworkState;

export type NetworkContextType = {|
  networkName: string,
  networkConfig: NetworkConfig,

  // time window of network health metrics in hours
  networkHealthTimeWindowHrs: number,
  setAvailabilityWindow: number => void,

  networkLinkHealth: NetworkHealth,
  networkNodeHealthPrometheus: NetworkNodeStats,
  networkAnalyzerData: NetworkAnalyzerData,
  networkLinkMetrics: {},

  // Refresh data
  refreshNetworkConfig: () => void,

  // Topology maps
  nodeMap: NodeMap,
  nodeToLinksMap: NodeToLinksMap,
  linkMap: LinkMap,
  siteMap: SiteMap,
  siteToNodesMap: SiteToNodesMap,
  macToNodeMap: MacToNodeMap,
  // Topology elements
  selectedElement: ?Element,
  pinnedElements: Array<Element>,
  setSelected: ($Values<typeof TOPOLOGY_ELEMENT>, string) => void,
  removeElement: ($Values<typeof TOPOLOGY_ELEMENT>, string) => void,
  togglePin: ToggleTopologyElement,
  toggleExpanded: ToggleTopologyElement,
  hardwareProfiles: HardwareProfiles,
|};

export type ToggleTopologyElement = {
  ($Values<typeof TOPOLOGY_ELEMENT>, string, boolean): any,
};

export type NetworkNodeStats = {
  [string /* node name */]: {
    // TODO - value should be numeric but the prometheus response is a string
    [string /* metric name */]: string /* value */,
  },
};

//nms and thrift have different definitions.
//server decorates the thrift definition with NMS specific functionality
export type LinkMeta = {
  _meta_: {
    angle: number,
    distance: number,
  },
};

export type Element = {|
  expanded: boolean,
  name: string,
  type: $Values<typeof TOPOLOGY_ELEMENT>,
|};

export type SiteMap = {
  [string]: Site,
};

export type NodeMap = {
  [string]: NodeType,
};

export type LinkMap = {[string]: LinkType & LinkMeta};

export type SiteToNodesMap = {
  [string]: Set<string>,
};

// Map from node name to links
export type NodeToLinksMap = {
  [nodeName: string]: Set<string>, // links the node is part of
};

export type MacToNodeMap = {
  [mac: string]: string,
};

export type Site = {|
  location: LocationType,
  name: string,
|};

// store topology data
const NetworkContext = React.createContext<NetworkContextType>({
  networkName: '',
  networkConfig: ({}: $Shape<NetworkState>),
  networkHealthTimeWindowHrs: 24,
  networkLinkHealth: {},
  networkNodeHealthPrometheus: {},
  networkAnalyzerData: {},

  // Refresh data
  refreshNetworkConfig: () => {},

  // Topology maps
  nodeMap: {},
  nodeToLinksMap: {},
  linkMap: {},
  siteMap: {},
  siteToNodesMap: {},
  macToNodeMap: {},

  // Topology elements
  selectedElement: null,
  pinnedElements: [],
  setSelected: () => {},
  removeElement: () => {},
  togglePin: () => {},
  toggleExpanded: () => {},
  networkLinkMetrics: {},
  setAvailabilityWindow: () => {},
  hardwareProfiles: {},
});

export function useNetworkContext() {
  const ctx = React.useContext(NetworkContext);
  return ctx;
}

export default NetworkContext;
