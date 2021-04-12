/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow
 */
import * as React from 'react';
import {TopologyElementType} from '@fbcnms/tg-nms/app/constants/NetworkConstants';

import type {
  Element,
  NetworkContextType,
} from '@fbcnms/tg-nms/app/contexts/NetworkContext';
import type {
  LocationType,
  TemporaryTopologyType,
} from '@fbcnms/tg-nms/shared/types/Topology';

export type MapLayerConfig = {
  layerId: string,
  name: string,
  render: NetworkContextType => React.Node,
};

export type LayerData<T> = $Shape<{|
  link_lines: T,
  site_icons: T,
  nodes: T,
  site_name_popups: T,
  alert_popups: T,
  buildings_3d: T,
  area_polygons: T,
|}>;

// selected overlay ids for each layer
export type SelectedOverlays = LayerData<string>;

// available overlay configs for each layer
export type OverlaysConfig = LayerData<OverlayConfig>;

// which overlays to show
export type OverlayConfig = {|
  layerId: string,
  overlays: Array<Overlay>,
  defaultOverlayId?: string,
  legend: {
    [overlayid: string]: {
      [metricval: string]: {
        color: string,
      },
    },
  },
|};

export type OverlayComponentProps = {|
  overlay: Overlay,
|};

export type Overlay = {|
  name: string,
  type: string,
  id: string,
  metrics?: Array<string>,
  range?: Array<number>,
  colorRange?: Array<string>,
  units?: string,
  bounds?: Array<number>,
  overlayLegendType?: string,
  aggregate?: any => number,
  formatText?: (link: any, value: any, index: number) => string,
  /**
   * Render MapboxGL Sources, Layers, Features to construct this overlay. This
   * will completely override the default logic of the layer.
   */
  Component?: React.ComponentType<OverlayComponentProps>,
|};

export type SelectedLayersType = LayerData<boolean>;

export type NetworkMapOptions = $Shape<{
  selectedLayers: SelectedLayersType,
  selectedOverlays: SelectedOverlays,
  historicalDate: Date,
  selectedTime: Date,
  historicalData: ?{},
  testExecutionData: ?{results: {}, type: $Values<typeof TopologyElementType>},
  scanLinkData: ?{},
  temporaryTopology?: ?TemporaryTopologyType,
  temporarySelectedAsset?: ?Element,
  overlayData: LayerData<{}>,
  mapMode: string,
}>;

export type MapFeatureTopology = {|
  sites: {|[name: string]: SiteFeature|},
  links: {|[name: string]: LinkFeature|},
  nodes: {|[name: string]: NodeFeature|},
|};

export type LinkFeature = {|
  name: string,
  a_node_name: string,
  z_node_name: string,
  link_type: number, //$Values<typeof LinkTypeValueMap>,
  properties: Object,
|};

export const SITE_FEATURE_TYPE = {
  DN: 0,
  CN: 1,
  POP: 2,
};

export type SiteFeature = {|
  name: string,
  location: LocationType,
  properties: Object,
  site_type: $Values<typeof SITE_FEATURE_TYPE>,
|};
export type NodeFeature = {|
  name: string,
  site_name: string,
  // does this even make sense for multi-radio nodes?
  ant_azimuth: number,
  properties: Object,
|};
