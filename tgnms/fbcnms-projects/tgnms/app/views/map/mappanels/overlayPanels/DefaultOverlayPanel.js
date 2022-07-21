/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import * as React from 'react';
import * as prometheusApi from '@fbcnms/tg-nms/app/apiutils/PrometheusAPIUtil';
import NetworkContext from '@fbcnms/tg-nms/app/contexts/NetworkContext';
import axios from 'axios';
import useInterval from '@fbcnms/ui/hooks/useInterval';
import {
  AREA_OVERLAYS,
  LINK_METRIC_OVERLAYS,
  LinkOverlayColors,
  NODE_OVERLAYS,
  OVERLAY_NONE,
  SITE_METRIC_OVERLAYS,
  SiteOverlayColors,
} from '@fbcnms/tg-nms/app/constants/LayerConstants';
import {merge} from 'lodash';
import {objectValuesTypesafe} from '@fbcnms/tg-nms/app/helpers/ObjectHelpers';
import {useMapContext} from '@fbcnms/tg-nms/app/contexts/MapContext';

import type {Overlay} from '@fbcnms/tg-nms/app/features/map/NetworkMapTypes';

// Interval at which link overlay metrics are refreshed (in ms)
const LINK_OVERLAY_METRIC_REFRESH_INTERVAL_MS = 30000;

const defaultOverlays = {
  link_lines: 'ignition_status',
  site_icons: 'health',
  area_polygons: OVERLAY_NONE.id,
  nodes: OVERLAY_NONE.id,
};

export default function DefaultOverlayPanel() {
  const {
    setOverlaysConfig,
    selectedOverlays,
    setOverlayData,
    setIsOverlayLoading,
  } = useMapContext();
  const {networkName} = React.useContext(NetworkContext);
  const [lastRefreshDate, setLastRefreshDate] = React.useState(new Date());

  useInterval(() => {
    setLastRefreshDate(new Date());
  }, LINK_OVERLAY_METRIC_REFRESH_INTERVAL_MS);
  /**
   * when component first mounts, change the available overlays and select
   * the default overlays
   */
  React.useEffect(() => {
    setOverlaysConfig({
      link_lines: {
        layerId: 'link_lines',
        overlays: objectValuesTypesafe(LINK_METRIC_OVERLAYS),
        legend: LinkOverlayColors,
        defaultOverlayId: defaultOverlays.link_lines,
      },
      site_icons: {
        layerId: 'site_icons',
        overlays: objectValuesTypesafe<Overlay>(SITE_METRIC_OVERLAYS),
        legend: SiteOverlayColors,
        defaultOverlayId: defaultOverlays.site_icons,
      },
      nodes: {
        layerId: 'nodes',
        overlays: objectValuesTypesafe<Overlay>(NODE_OVERLAYS),
        defaultOverlayId: defaultOverlays.nodes,
        legend: {},
      },
      area_polygons: {
        layerId: 'area_polygons',
        overlays: objectValuesTypesafe<Overlay>(AREA_OVERLAYS),
        defaultOverlayId: defaultOverlays.area_polygons,
        legend: SiteOverlayColors,
      },
    });
  }, [setOverlaysConfig]);

  React.useEffect(() => {
    async function fetchLinkOverlayData() {
      if (selectedOverlays.link_lines) {
        setIsOverlayLoading(true);
        const overlay = LINK_METRIC_OVERLAYS[selectedOverlays.link_lines];
        if (!overlay) {
          console.error(`no overlay with id: ${selectedOverlays.link_lines}`);
          return;
        }

        try {
          const overlayData = {};
          // custom metrics query
          if (typeof overlay.query === 'function') {
            const query = overlay.query({
              network: networkName,
              intervalSec: 30,
            });
            const response = await prometheusApi.queryLatest(
              query,
              networkName,
            );
            for (const res of response.result) {
              const {linkName, linkDirection} = res.metric;
              if (linkName == null) {
                continue;
              }
              if (overlayData[linkName] == null) {
                overlayData[linkName] = {};
              }
              overlayData[linkName][linkDirection] = {
                [overlay.id]: res.value[1],
              };
            }
          }
          // simple query for just metric names
          const metricNames = Array.isArray(overlay.metrics)
            ? overlay.metrics.join(',')
            : overlay.id;
          const response = await axios.get<{}, {}>(
            `/metrics/${networkName}/overlay/linkStat/${metricNames}`,
          );
          merge(overlayData, response.data);
          setOverlayData({link_lines: overlayData});
        } catch (error) {
          console.error(error);
        } finally {
          setIsOverlayLoading(false);
        }
      }
    }
    fetchLinkOverlayData();
  }, [
    networkName,
    selectedOverlays.link_lines,
    setOverlayData,
    lastRefreshDate,
    setIsOverlayLoading,
  ]);

  return <span />;
}
