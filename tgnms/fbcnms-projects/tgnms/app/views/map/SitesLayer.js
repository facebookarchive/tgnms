/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 */
'use strict';

import PropTypes from 'prop-types';
import React from 'react';
import {Feature, Layer} from 'react-mapbox-gl';
import {
  LinkType,
  NodeType,
  PolarityType,
} from '../../../thrift/gen-nodejs/Topology_types';
import {Popup} from 'react-mapbox-gl';
import {SiteOverlayColors} from '../../constants/LayerConstants';
import {getNodePolarities} from '../../helpers/TgFeatures';
import {
  hasNodeEverGoneOnline,
  mapboxShouldAcceptClick,
} from '../../helpers/NetworkHelpers';
import {isNodeAlive, renderSnrWithIcon} from '../../helpers/NetworkHelpers';
import {withStyles} from '@material-ui/core/styles';

const styles = {
  iconBottom: {
    verticalAlign: 'bottom',
    paddingRight: 4,
  },
};

// === Base paint (for all site types) ===
const POSITION_CIRCLE_PAINT = {
  'circle-blur': 0.15,
  'circle-color': ['get', 'siteColor'],
  'circle-radius': ['get', 'circleRadius'],
  'circle-stroke-color': ['get', 'strokeColor'],
  'circle-stroke-opacity': 0.6,
  'circle-stroke-width': ['get', 'strokeWidth'],
};
const CIRCLE_RADIUS = 10;
const INNER_CIRCLE_RADIUS = 5;

// === Inner circle paint (for special site types) ===
// TODO - Make a legend for this
const POP_SITE_COLOR = 'blue';
const CN_SITE_COLOR = 'pink';

// === Selected site paint ===
const SELECTED_CIRCLE_STROKE_COLOR = '#0077ff';
const SELECTED_CIRCLE_STROKE_WIDTH = 5;

// === Planned site paint ===
const PLANNED_SITE_COLOR = '#fff';
const PLANNED_SITE_STROKE_COLOR = '#000';

// === "Search Nearby" site paint ===
const SEARCH_NEARBY_SITE_COLOR = '#eee';
const SEARCH_NEARBY_STROKE_COLOR = '#aec6cf';
const SEARCH_NEARBY_STROKE_WIDTH = 5;

class SitesLayer extends React.Component {
  getSitePolarityColor(siteNodes) {
    const {ctrlVersion, topologyConfig} = this.props;

    let sitePolarity = null;
    for (const node of siteNodes) {
      const mac2Polarity = getNodePolarities(ctrlVersion, node, topologyConfig);
      let nodePolarity = null;
      for (const mac of Object.keys(mac2Polarity)) {
        const macPolarity = mac2Polarity[mac];
        if (nodePolarity === null) {
          nodePolarity = macPolarity;
        } else if (nodePolarity !== macPolarity) {
          return SiteOverlayColors.polarity.hw_hybrid.color;
        }
      }
      if (sitePolarity === null) {
        sitePolarity = nodePolarity;
      } else if (sitePolarity !== nodePolarity) {
        // Site polarity has been set and doesn't match another nodes polarity
        return SiteOverlayColors.polarity.hw_hybrid.color;
      }
    }

    if (sitePolarity === null) {
      return SiteOverlayColors.polarity.unknown.color;
    }

    sitePolarity = parseInt(sitePolarity, 10);
    switch (sitePolarity) {
      case PolarityType.ODD:
        return SiteOverlayColors.polarity.odd.color;
      case PolarityType.EVEN:
        return SiteOverlayColors.polarity.even.color;
      case PolarityType.HYBRID_ODD:
        return SiteOverlayColors.polarity.hybrid_odd.color;
      case PolarityType.HYBRID_EVEN:
        return SiteOverlayColors.polarity.hybrid_even.color;
      default:
        return SiteOverlayColors.polarity.unknown.color;
    }
  }

  getSiteHealthColor(siteNodes, siteWiredLinks) {
    const {offlineWhitelist} = this.props;
    const healthyNodeCount = siteNodes.filter(node => isNodeAlive(node.status))
      .length;
    const healthyLinkCount = siteWiredLinks.filter(link => link.is_alive)
      .length;

    if (siteNodes.length === 0) {
      return SiteOverlayColors.health.empty.color;
    } else if (
      healthyNodeCount === siteNodes.length &&
      healthyLinkCount === siteWiredLinks.length
    ) {
      return SiteOverlayColors.health.healthy.color;
    } else if (healthyNodeCount === 0) {
      if (
        !siteNodes.some(node => hasNodeEverGoneOnline(node, offlineWhitelist))
      ) {
        return SiteOverlayColors.health.empty.color;
      } else {
        return SiteOverlayColors.health.unhealthy.color;
      }
    } else {
      return SiteOverlayColors.health.partial.color;
    }
  }

  getSiteColor(site) {
    const {overlay, nodeMap, siteToNodesMap, routes, topology} = this.props;
    const siteNodes = [...siteToNodesMap[site.name]].map(
      nodeName => nodeMap[nodeName],
    );

    // if viewing route overlay, only color in route nodes
    if (routes.nodes && routes.nodes.size !== 0) {
      const inRoutes = siteNodes.filter(node => routes.nodes.has(node.name))
        .length;
      if (inRoutes) {
        return SiteOverlayColors.health.healthy.color;
      } else {
        return SiteOverlayColors.health.empty.color;
      }
    }

    let siteColor;
    switch (overlay) {
      case 'polarity':
        siteColor = this.getSitePolarityColor(siteNodes);
        break;
      default:
        // use 'health' as default overlay
        // get wired intrasite links to help calculate site health
        const siteNodeSet = new Set(siteNodes.map(node => node.name));
        const siteWiredLinks = topology.links.filter(
          link =>
            link.link_type === LinkType.ETHERNET &&
            siteNodeSet.has(link.a_node_name) &&
            siteNodeSet.has(link.z_node_name),
        );
        siteColor = this.getSiteHealthColor(siteNodes, siteWiredLinks);
        break;
    }
    return siteColor;
  }

  handleSiteClick = site => evt => {
    // Handle clicking on a site
    if (mapboxShouldAcceptClick(evt)) {
      this.props.onSelectSiteChange(site.name);
    }
  };

  render() {
    const {
      classes,
      topology,
      selectedSites,
      nodeMap,
      siteToNodesMap,
      onSiteMouseEnter,
      onSiteMouseLeave,
      plannedSite,
      onPlannedSiteMoved,
      nearbyNodes,
      hiddenSites,
    } = this.props;

    // Draw sites in topology
    const features = [];
    topology.sites
      .filter(site => !hiddenSites.has(site.name))
      .forEach(site => {
        // Add site feature
        const featureParams = {
          coordinates: [site.location.longitude, site.location.latitude],
          onMouseEnter: onSiteMouseEnter,
          onMouseLeave: onSiteMouseLeave,
          onClick: this.handleSiteClick(site),
        };
        features.push(
          <Feature
            key={'circle-layer-' + site.name}
            {...featureParams}
            properties={{
              siteColor: this.getSiteColor(site),
              circleRadius: CIRCLE_RADIUS,
              strokeColor: SELECTED_CIRCLE_STROKE_COLOR,
              strokeWidth: selectedSites.hasOwnProperty(site.name)
                ? SELECTED_CIRCLE_STROKE_WIDTH
                : 0,
            }}
          />,
        );

        // Check for special properties, and render "inner" circles if needed
        const siteNodes = [...siteToNodesMap[site.name]];
        const hasPop =
          siteNodes.find(nodeName => nodeMap[nodeName].pop_node) !== undefined;
        const hasCn =
          siteNodes.find(
            nodeName => nodeMap[nodeName].node_type === NodeType.CN,
          ) !== undefined;
        if (hasPop) {
          features.push(
            <Feature
              key={'inner-circle-layer-' + site.name}
              {...featureParams}
              properties={{
                siteColor: POP_SITE_COLOR,
                circleRadius: INNER_CIRCLE_RADIUS,
                strokeWidth: 0,
              }}
            />,
          );
        } else if (hasCn) {
          features.push(
            <Feature
              key={'inner-circle-layer-' + site.name}
              {...featureParams}
              properties={{
                siteColor: CN_SITE_COLOR,
                circleRadius: INNER_CIRCLE_RADIUS,
                strokeWidth: 0,
              }}
            />,
          );
        }
      });

    // Draw planned site
    if (plannedSite) {
      features.push(
        <Feature
          key="planned-site"
          onMouseEnter={onSiteMouseEnter}
          onMouseLeave={onSiteMouseLeave}
          coordinates={[plannedSite.longitude, plannedSite.latitude]}
          properties={{
            siteColor: PLANNED_SITE_COLOR,
            circleRadius: CIRCLE_RADIUS,
            strokeColor: PLANNED_SITE_STROKE_COLOR,
            strokeWidth: SELECTED_CIRCLE_STROKE_WIDTH,
          }}
          draggable
          onDragEnd={onPlannedSiteMoved}
        />,
      );
    }

    // Draw "nearby" sites (from topology scan)
    // Also render node popups here
    const nearbyNodePopups = [];
    Object.entries(nearbyNodes).forEach(([txNode, responders]) => {
      if (responders) {
        responders.forEach(responder => {
          const location = responder.responderInfo.pos;
          const key = 'nearby-' + txNode + '-' + responder.responderInfo.addr;
          if (location) {
            features.push(
              <Feature
                key={key}
                onMouseEnter={onSiteMouseEnter}
                onMouseLeave={onSiteMouseLeave}
                coordinates={[location.longitude, location.latitude]}
                properties={{
                  siteColor: SEARCH_NEARBY_SITE_COLOR,
                  circleRadius: CIRCLE_RADIUS,
                  strokeColor: SEARCH_NEARBY_STROKE_COLOR,
                  strokeWidth: SEARCH_NEARBY_STROKE_WIDTH,
                }}
              />,
            );
            nearbyNodePopups.push(
              <Popup
                key={key + '-popup'}
                coordinates={[location.longitude, location.latitude]}>
                <div>
                  {renderSnrWithIcon(responder.bestSnr, {
                    classes: {root: classes.iconBottom},
                  })}
                  {responder.responderInfo.addr}
                </div>
              </Popup>,
            );
          }
        });
      }
    });

    return (
      <>
        <Layer
          type="circle"
          key={'site-layer'}
          id={'site-layer'}
          paint={POSITION_CIRCLE_PAINT}>
          {features}
        </Layer>

        {nearbyNodePopups}
      </>
    );
  }
}

SitesLayer.propTypes = {
  onSiteMouseEnter: PropTypes.func,
  onSiteMouseLeave: PropTypes.func,
  topology: PropTypes.object.isRequired,
  topologyConfig: PropTypes.object.isRequired,
  ctrlVersion: PropTypes.string,
  selectedSites: PropTypes.object.isRequired, // {siteName: thrift::Site}
  onSelectSiteChange: PropTypes.func.isRequired,
  nodeMap: PropTypes.object,
  siteToNodesMap: PropTypes.object,
  plannedSite: PropTypes.object,
  onPlannedSiteMoved: PropTypes.func,
  overlay: PropTypes.string.isRequired,
  nearbyNodes: PropTypes.object,
  hiddenSites: PropTypes.instanceOf(Set),
  routes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SitesLayer);
