/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 */
'use strict';

import EventLogs from './EventLogs.js';
import ModalLinkAdd from './ModalLinkAdd.js';
import ModalNodeAdd from './ModalNodeAdd.js';
import ModalOverlays from './ModalOverlays.js';
import NMSConfig from './NMSConfig.js';
import NetworkAlerts from './NetworkAlerts.js';
import NetworkDashboards from './NetworkDashboards.js';
import Dispatcher from './NetworkDispatcher.js';
import NetworkMap from './NetworkMap.js';
import NetworkStats from './NetworkStats.js';
import SystemLogs from './SystemLogs.js';
import NetworkConfigContainer from './components/networkconfig/NetworkConfigContainer.js';
import NetworkUpgrade from './components/upgrade/NetworkUpgrade.js';
// dispatcher
import {Actions} from './constants/NetworkConstants.js';
import {
  SiteOverlayKeys,
  LinkOverlayKeys,
} from './constants/NetworkConstants.js';
import NetworkStore from './stores/NetworkStore.js';
import moment from 'moment';
// menu bar
import Menu, {SubMenu, Item as MenuItem, Divider} from 'rc-menu';
import {Glyphicon} from 'react-bootstrap';
// leaflet maps
import {render} from 'react-dom';
import React from 'react';

// icon: Glyphicon from Bootstrap 3.3.7
const VIEWS = {
  map: {name: 'Map', icon: 'map-marker'},
  dashboards: {name: 'Dashboards', icon: 'dashboard'},
  stats: {name: 'Stats', icon: 'stats'},
  eventlogs: {name: 'Event Logs', icon: 'list'},
  systemlogs: {name: 'System Logs', icon: 'hdd'},
  alerts: {name: 'Alerts', icon: 'alert'},
  upgrade: {name: 'Upgrade', icon: 'upload'},
  'nms-config': {name: 'NMS Instance Config (Alpha)', icon: 'cloud'},
  config: {name: 'Network Config', icon: 'cog'},
};

const TOPOLOGY_OPS = {
  addSite: 'Add Planned Site',
  addNode: 'Add Node',
  addLink: 'Add Link',
};

// update network health at a lower interval (seconds)
const NETWORK_HEALTH_INTERVAL_MIN = 30;

export default class NetworkUI extends React.Component {
  state = {
    view: NetworkStore.viewName,
    // additional props for a view
    viewContext: {},

    networkName: NetworkStore.networkName,
    networkConfig: {},
    nodesByName: {},
    topologies: [],
    routing: {},
    overlaysModalOpen: false,
    topologyModalOpen: false,

    selectedSiteOverlay: 'Health',
    selectedLinkOverlay: 'Health',
    selectedMapDimType: 'Default',
    selectedMapTile: 'Default',
    topology: {},
    // additional topology to render on the map
    pendingTopology: {},
    commitPlan: null,

    // Last selected dashboard for NetworkDashboards
    selectedDashboard: null,
  };

  constructor(props) {
    super(props);
    // register for menu changes
    this.dispatchToken = Dispatcher.register(
      this.handleDispatchEvent.bind(this),
    );
    // refresh network config
    const refresh_interval = window.CONFIG.refresh_interval
      ? window.CONFIG.refresh_interval
      : 5000;
    // load data if network name known
    this.getNetworkStatusPeriodic();
    setInterval(this.getNetworkStatusPeriodic.bind(this), refresh_interval);
  }

  handleSelectedDashboardChange(selectedDashboard) {
    this.setState({selectedDashboard: selectedDashboard});
  }

  getNetworkStatusPeriodic() {
    if (this.state.networkName != null) {
      this.getNetworkStatus(this.state.networkName);
      // initial load
      if (this.state.commitPlan == null) {
        this.fetchCommitPlan(this.state.networkName);
      }
    }
  }

  getNetworkStatus(networkName) {
    const topoGetFetch = new Request('/topology/get/' + networkName, {
      credentials: 'same-origin',
    });
    fetch(topoGetFetch).then(
      function(response) {
        if (response.status == 200) {
          response.json().then(
            function(json) {
              // TODO: normalize the topology with health data if it exists
              this.setState({
                networkConfig: json,
              });
              // dispatch the updated topology json
              Dispatcher.dispatch({
                actionType: Actions.TOPOLOGY_REFRESHED,
                networkConfig: json,
              });
            }.bind(this),
          );
        } else if (response.status == 404) {
          // topology is invalid, switch to the first topology in the list
          if (this.state.topologies.length) {
            Dispatcher.dispatch({
              actionType: Actions.TOPOLOGY_SELECTED,
              networkName: this.state.topologies[0].name,
            });
          }
        }
      }.bind(this),
    );
  }

  fetchCommitPlan(networkName) {
    // handle commit plan overlay
    const commitPlanReq = {
      topologyName: networkName,
      limit: 100,
      excludeNodes: [],
    };
    const commitPlanFetch = new Request('/controller/commitUpgradePlan', {
      method: 'POST',
      body: JSON.stringify(commitPlanReq),
      credentials: 'same-origin',
    });
    fetch(commitPlanFetch).then(
      function(response) {
        if (response.status == 200) {
          response.json().then(
            function(json) {
              const commitPlan = json;
              commitPlan.commitBatches = commitPlan.commitBatches.map(batch => {
                return new Set(batch);
              });
              this.setState({
                commitPlan: commitPlan,
              });
            }.bind(this),
          );
        }
      }.bind(this),
    );
  }

  handleDispatchEvent(payload) {
    switch (payload.actionType) {
      case Actions.VIEW_SELECTED:
        const viewName = payload.viewName;
        // ignore the menu
        if (viewName == '#') {
          break;
        }
        this.setState({
          view: viewName,
          viewContext: payload.context ? payload.context : {},
        });
        // construct new URL from selected view
        break;
      case Actions.TOPOLOGY_SELECTED:
        // update selected topology
        this.getNetworkStatus(payload.networkName);
        // fetch commit plan once per topology
        // TODO: add refresh ability
        this.fetchCommitPlan(payload.networkName);
        this.setState({
          networkName: payload.networkName,
        });
        // reset our health updater (make this better)
        this.lastHealthRequestTime = 0;
        this.lastAnalyzerRequestTime = 0;
        // update the browser URL history
        break;
      case Actions.TOPOLOGY_REFRESHED:
        const nodesByName = {};
        payload.networkConfig.topology.nodes.forEach(node => {
          nodesByName[node.name] = node;
        });
        // update node name mapping
        this.setState({
          nodesByName: nodesByName,
          topology: payload.networkConfig.topology,
        });
        // update link health
        this.updateNetworkLinkHealth(this.state.networkName);
        this.updateNetworkAnalyzer(this.state.networkName);
        this.updateLinkOverlayStat(this.state.networkName);
        break;
      case Actions.PENDING_TOPOLOGY:
        this.setState({
          pendingTopology: payload.topology,
        });
        break;
      case Actions.SCAN_FETCH:
        this.updateScanResults(this.state.networkName, payload.mysqlfilter);
        break;
    }
  }

  updateNetworkLinkHealth(networkName) {
    // refresh link health
    const lastAttemptAgo = new Date() / 1000 - this.lastHealthRequestTime;
    if (lastAttemptAgo <= NETWORK_HEALTH_INTERVAL_MIN) {
      return;
    }
    const linkHealthFetch = new Request('/health/' + networkName, {
      credentials: 'same-origin',
    });
    // update last request time
    this.lastHealthRequestTime = new Date() / 1000;
    fetch(linkHealthFetch).then(function(response) {
      if (response.status == 200) {
        response
          .json()
          .then(function(json) {
            // merge data
            if (json.length != 2) {
              return;
            }
            Dispatcher.dispatch({
              actionType: Actions.HEALTH_REFRESHED,
              nodeHealth: json[0],
              linkHealth: json[1],
            });
          })
          .catch(error => {});
      }
    });
  }

  updateNetworkAnalyzer(networkName) {
    // refresh link health
    const lastAttemptAgo = new Date() / 1000 - this.lastAnalyzerRequestTime;
    if (lastAttemptAgo <= NETWORK_HEALTH_INTERVAL_MIN) {
      return;
    }
    const linkAnalyzerFetch = new Request('/link_analyzer/' + networkName, {
      credentials: 'same-origin',
    });
    // update last request time
    this.lastAnalyzerRequestTime = new Date() / 1000;
    fetch(linkAnalyzerFetch).then(function(response) {
      if (response.status == 200) {
        response
          .json()
          .then(json => {
            // merge data
            if (json.length != 1) {
              return;
            }
            // ensure we can decode the response
            Dispatcher.dispatch({
              actionType: Actions.ANALYZER_REFRESHED,
              analyzerTable: json[0],
            });
          })
          .catch(error => {});
      }
    });
  }

  // see scan_results in server.js
  updateScanResults(networkName, filter) {
    const lastAttemptAgo = new Date() / 1000 - this.lastAnalyzerRequestTime;
    let scanResultsFetch = [];
    // if a nodeName is given, use it, otherwise use the topology name
    scanResultsFetch = new Request(
      '/scan_results?topology=' +
        networkName +
        '&filter[row_count]=' +
        filter.row_count +
        '&filter[offset]=' +
        filter.offset +
        '&filter[nodeFilter0]=' +
        filter.nodeFilter[0] +
        '&filter[nodeFilter1]=' +
        filter.nodeFilter[1],
      {
        credentials: 'same-origin',
      },
    );

    // update last request time
    this.lastScanRequestTime = new Date() / 1000;
    fetch(scanResultsFetch).then(function(response) {
      if (response.status == 200) {
        response.json().then(function(json) {
          Dispatcher.dispatch({
            actionType: Actions.SCAN_REFRESHED,
            scanResults: json,
          });
        });
      }
    });
  }

  updateLinkOverlayStat(networkName) {
    if (this.state.selectedLinkOverlay) {
      const overlaySource = LinkOverlayKeys[this.state.selectedLinkOverlay];
      const metric = overlaySource.metric;

      if (metric) {
        // refresh link overlay stat
        const linkHealthFetch = new Request(
          '/overlay/linkStat/' + networkName + '/' + metric,
          {credentials: 'same-origin'},
        );
        fetch(linkHealthFetch).then(function(response) {
          if (response.status == 200) {
            response.json().then(function(json) {
              Dispatcher.dispatch({
                actionType: Actions.LINK_OVERLAY_REFRESHED,
                overlay: json[0],
              });
            });
          }
        });
      }
    }
  }

  refreshTopologyList() {
    // topology list
    const topoListFetch = new Request('/topology/list', {
      credentials: 'same-origin',
    });
    fetch(topoListFetch).then(
      function(response) {
        if (response.status == 200) {
          response.json().then(
            function(json) {
              this.setState({
                topologies: json,
              });
              // dispatch the whole network topology struct
              Dispatcher.dispatch({
                actionType: Actions.TOPOLOGY_LIST_REFRESHED,
                topologies: json,
              });
              // select the first topology by default
              if (!this.state.networkName && this.state.topologies.length) {
                Dispatcher.dispatch({
                  actionType: Actions.TOPOLOGY_SELECTED,
                  networkName: this.state.topologies[0].name,
                });
              }
            }.bind(this),
          );
        }
      }.bind(this),
    );
  }

  UNSAFE_componentWillMount() {
    this.setState({
      topologies: [],
    });
    // fetch topology config
    this.refreshTopologyList();
    // refresh every 10 seconds
    setInterval(this.refreshTopologyList.bind(this), 10000);
  }

  onAddSite() {
    Dispatcher.dispatch({
      actionType: Actions.PLANNED_SITE_CREAT,
      siteName: 'planned_site',
    });
    swal(
      {
        title: 'Planned Site Added',
        text:
          'Drag the planned site on the map to desired location. Then, you can commit it from the details menu.',
        type: 'info',
        closeOnConfirm: true,
      },
      function() {
        this.setState({topologyModalOpen: false});
      }.bind(this),
    );
  }

  handleMenuBarSelect(info) {
    if (info.key.indexOf('#') > -1) {
      const keySplit = info.key.split('#');
      switch (keySplit[0]) {
        case 'view':
          Dispatcher.dispatch({
            actionType: Actions.VIEW_SELECTED,
            viewName: keySplit[1],
          });
          break;
        case 'topo':
          Dispatcher.dispatch({
            actionType: Actions.TOPOLOGY_SELECTED,
            networkName: keySplit[1],
          });
          break;
        case 'overlays':
          this.setState({overlaysModalOpen: true});
          break;
        case 'topOps':
          switch (keySplit[1]) {
            case 'addSite':
              this.onAddSite();
              break;
            case 'addNode':
              this.setState({topOpsAddNodeModalOpen: true});
              break;
            case 'addLink':
              this.setState({topOpsAddLinkModalOpen: true});
              break;
          }
          break;
      }
    }
  }

  overlaysModalClose(siteOverlay, linkOverlay, mapDimType, mapTile) {
    this.setState({
      overlaysModalOpen: false,
      selectedSiteOverlay: siteOverlay,
      selectedLinkOverlay: linkOverlay,
      selectedMapDimType: mapDimType,
      selectedMapTile: mapTile,
    });
    Dispatcher.dispatch({
      actionType: Actions.LINK_OVERLAY_REFRESHED,
      overlay: null,
    });
  }

  render() {
    const topologyMenuItems = [];
    for (let i = 0; i < this.state.topologies.length; i++) {
      const topologyConfig = this.state.topologies[i];
      const keyName = 'topo#' + topologyConfig.name;
      let online = topologyConfig.controller_online;
      let controllerErrorMsg;
      if (topologyConfig.hasOwnProperty('controller_error')) {
        online = false;
        controllerErrorMsg = (
          <span style={{color: 'red', fontWeight: 'bold'}}>(Error)</span>
        );
      }
      topologyMenuItems.push(
        <MenuItem key={keyName}>
          <img
            src={'/static/images/' + (online ? 'online' : 'offline') + '.png'}
          />
          {topologyConfig.name}
          {controllerErrorMsg}
        </MenuItem>,
      );
    }
    let networkStatusMenuItems = [];
    if (this.state.networkConfig && this.state.networkConfig.topology) {
      const topology = this.state.networkConfig.topology;
      const linksOnline = topology.links.filter(
        link => link.link_type == 1 && link.is_alive,
      ).length;
      const linksWireless = topology.links.filter(link => link.link_type == 1)
        .length;
      // online + online initiator
      const sectorsOnline = topology.nodes.filter(
        node => node.status == 2 || node.status == 3,
      ).length;
      const e2eStatusList = [];
      if (this.state.networkConfig.hasOwnProperty('controller_events')) {
        this.state.networkConfig.controller_events
          .slice()
          .reverse()
          .forEach((eventArr, index) => {
            if (eventArr.length != 2) {
              return;
            }
            const timeStr = moment(new Date(eventArr[0])).format(
              'M/D/YY HH:mm:ss',
            );
            e2eStatusList.push(
              <MenuItem key={'e2e-status-events' + index} disabled>
                <img
                  src={
                    '/static/images/' +
                    (eventArr[1] ? 'online' : 'offline') +
                    '.png'
                  }
                />
                {timeStr}
              </MenuItem>,
            );
          });
      }
      networkStatusMenuItems = [
        <SubMenu
          key="e2e-status-menu"
          mode="vertical"
          title="E2E"
          className={
            this.state.networkConfig.controller_online
              ? 'svcOnline'
              : 'svcOffline'
          }>
          {e2eStatusList}
        </SubMenu>,
        <Divider key="status-divider" />,
        <SubMenu
          key="nms-status-menu"
          mode="vertical"
          title="STATS"
          disabled
          className={
            this.state.networkConfig.query_service_online
              ? 'svcOnline'
              : 'svcOffline'
          }>
          NMS
        </SubMenu>,
        <Divider key="site-divider" />,
        <MenuItem key="site-status" disabled>
          {topology.sites.length} Sites
        </MenuItem>,
        <Divider key="sector-divider" />,
        <MenuItem key="sector-status" disabled>
          {sectorsOnline}/{topology.nodes.length} Sectors
        </MenuItem>,
        <Divider key="link-divider" />,
        <MenuItem key="link-status" disabled>
          {linksOnline}/{linksWireless} Links
        </MenuItem>,
      ];
    }
    // don't load components without topology config
    if (
      !this.state.networkName ||
      !this.state.networkConfig ||
      !this.state.networkConfig.topology ||
      !this.state.networkConfig.topology.sites ||
      !this.state.networkConfig.topology.nodes
    ) {
      return (
        <div>
          <div className="loading-spinner-wrapper">
            <div className="loading-spinner">
              <img src="/static/images/loading-graphs.gif" />
            </div>
          </div>
        </div>
      );
    }
    // select between view panes
    const viewProps = {
      networkName: this.state.networkName,
      networkConfig: this.state.networkConfig,
      commitPlan: this.state.commitPlan,
      pendingTopology: this.state.pendingTopology,
      config: this.state.topologies,
      viewContext: this.state.viewContext,
    };
    let paneComponent = <div />;
    switch (this.state.view) {
      case 'eventlogs':
        paneComponent = <EventLogs {...viewProps} />;
        break;
      case 'systemlogs':
        paneComponent = <SystemLogs {...viewProps} />;
        break;
      case 'dashboards':
        paneComponent = (
          <NetworkDashboards
            {...viewProps}
            selectedDashboard={this.state.selectedDashboard}
            onHandleSelectedDashboardChange={selectedDashboard => {
              this.setState({
                selectedDashboard: selectedDashboard,
              });
            }}
          />
        );
        break;
      case 'stats':
        paneComponent = <NetworkStats {...viewProps} />;
        break;
      case 'alerts':
        paneComponent = <NetworkAlerts {...viewProps} />;
        break;
      case 'upgrade':
        paneComponent = (
          <NetworkUpgrade
            {...viewProps}
            upgradeStateDump={this.state.networkConfig.upgradeStateDump}
          />
        );
        break;
      case 'nms-config':
        paneComponent = <NMSConfig {...viewProps} />;
        break;
      case 'config':
        paneComponent = <NetworkConfigContainer {...viewProps} />;
        break;
      default:
        paneComponent = (
          <NetworkMap
            {...viewProps}
            linkOverlay={this.state.selectedLinkOverlay}
            siteOverlay={this.state.selectedSiteOverlay}
            mapDimType={this.state.selectedMapDimType}
            mapTile={this.state.selectedMapTile}
          />
        );
    }
    // add all selected keys
    const selectedKeys = ['view#' + this.state.view];
    if (this.state.networkName) {
      selectedKeys.push('topo#' + this.state.networkName);
    }

    let visibleModal = null;
    if (this.state.topOpsAddNodeModalOpen) {
      visibleModal = (
        <ModalNodeAdd
          isOpen={this.state.topOpsAddNodeModalOpen}
          onClose={() => this.setState({topOpsAddNodeModalOpen: false})}
          topology={this.state.topology}
        />
      );
    } else if (this.state.topOpsAddLinkModalOpen) {
      visibleModal = (
        <ModalLinkAdd
          isOpen={this.state.topOpsAddLinkModalOpen}
          onClose={() => this.setState({topOpsAddLinkModalOpen: false})}
          topology={this.state.topology}
        />
      );
    }

    let mapMenuItems = [];
    if (this.state.view === 'map') {
      mapMenuItems = [
        <Divider />,
        <SubMenu
          title={
            <span>
              Topology Operations <span className="caret" />
            </span>
          }
          key="topOps"
          mode="vertical">
          {Object.keys(TOPOLOGY_OPS).map(topOpsKey => {
            const topOpsName = TOPOLOGY_OPS[topOpsKey];
            return (
              <MenuItem key={'topOps#' + topOpsKey}>{topOpsName}</MenuItem>
            );
          })}
        </SubMenu>,
        <Divider />,
        <MenuItem key={'overlays#'}>
          <img src={'/static/images/overlays.png'} />
          Site/Link Overlays
        </MenuItem>,
      ];
    }

    return (
      <div>
        <ModalOverlays
          isOpen={this.state.overlaysModalOpen}
          selectedSiteOverlay={this.state.selectedSiteOverlay}
          selectedLinkOverlay={this.state.selectedLinkOverlay}
          selectedMapDimensions={this.state.selectedMapDimType}
          selectedMapTile={this.state.selectedMapTile}
          onClose={this.overlaysModalClose.bind(this)}
        />
        {visibleModal}

        <div className="top-menu-bar">
          <Menu
            onSelect={this.handleMenuBarSelect.bind(this)}
            mode="horizontal"
            selectedKeys={selectedKeys}
            style={{float: 'left'}}
            openAnimation="slide-up">
            <SubMenu
              title={
                <span>
                  View <span className="caret" />
                </span>
              }
              key="view"
              mode="vertical">
              {Object.keys(VIEWS).map(viewKey => {
                const viewName = VIEWS[viewKey].name;
                return (
                  <MenuItem key={'view#' + viewKey}>
                    <Glyphicon glyph={VIEWS[viewKey].icon} />
                    {VIEWS[viewKey].name}
                  </MenuItem>
                );
              })}
            </SubMenu>
            <MenuItem key="view-selected" disabled>
              <Glyphicon glyph={VIEWS[this.state.view].icon} />
              {VIEWS[this.state.view].name}
            </MenuItem>
            <Divider />
            <SubMenu
              title={
                <span>
                  Topology <span className="caret" />
                </span>
              }
              key="topo"
              mode="vertical">
              {topologyMenuItems}
            </SubMenu>
            <MenuItem key="topology-selected" disabled>
              {this.state.networkName ? this.state.networkName : '-'}
            </MenuItem>
            {mapMenuItems}
          </Menu>
          <Menu
            mode="horizontal"
            style={{float: 'right'}}
            openAnimation="slide-up">
            {networkStatusMenuItems}
          </Menu>
        </div>
        <div>{paneComponent}</div>
      </div>
    );
  }
}
