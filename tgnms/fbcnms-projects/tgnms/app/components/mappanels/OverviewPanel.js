/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow
 */

import Button from '@material-ui/core/Button';
import CustomExpansionPanel from '../common/CustomExpansionPanel';
import FriendlyText from '../common/FriendlyText';
import IconButton from '@material-ui/core/IconButton';
import ListIcon from '@material-ui/icons/List';
import MaterialModal from '../common/MaterialModal';
import NetworkContext from '../../NetworkContext';
import PersonIcon from '@material-ui/icons/Person';
import PropTypes from 'prop-types';
import React from 'react';
import SettingsIcon from '@material-ui/icons/Settings';
import StatusText from '../common/StatusText';
import Text from '@fbcnms/i18n/Text';
import Typography from '@material-ui/core/Typography';
import WifiIcon from '@material-ui/icons/Wifi';
import {BinaryStarFsmStateValueMap} from '../../../shared/types/Controller';
import {
  LinkTypeValueMap as LinkType,
  NodeTypeValueMap as NodeType,
} from '../../../shared/types/Topology';
import {TIME_WINDOWS} from '../../constants/NetworkConstants';
import {
  avg,
  avgOverTime,
  createQuery,
  queryLatest,
} from '../../apiutils/PrometheusAPIUtil';
import {
  formatNumber,
  formatNumberFixed,
  toTitleCase,
} from '../../helpers/StringHelpers';
import {
  getLinkIcon,
  getNodeIcon,
  getSiteIcon,
} from '../../helpers/MapPanelHelpers';
import {has, invert} from 'lodash';
import {isFeatureEnabled} from '../../constants/FeatureFlags';
import {
  isNodeAlive,
  renderAvailabilityWithColor,
} from '../../helpers/NetworkHelpers';
import {shortenVersionString} from '../../helpers/VersionHelper';
import {withStyles} from '@material-ui/core/styles';
import {withTranslation} from 'react-i18next';
import type {
  ControllerHAState,
  NetworkConfig,
  NetworkHealth,
  WirelessControllerStats,
} from '../../NetworkContext';

const styles = theme => ({
  button: {
    margin: theme.spacing(1),
  },
  buttonSelected: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.grey[300],
  },
  sectionSpacer: {
    height: theme.spacing(1),
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  iconCentered: {
    verticalAlign: 'middle',
    paddingRight: theme.spacing(1),
  },
  indented: {
    marginLeft: theme.spacing(1),
    overflowWrap: 'break-word',
    wordBreak: 'break-all',
  },
  errorText: {
    color: 'red',
    fontWeight: 'bold',
  },
  tdRight: {
    whiteSpace: 'nowrap',
    width: '1%',
    paddingLeft: theme.spacing(1),
  },
  vCenter: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
  },
  rightIconButton: {
    padding: 2,
    marginRight: -4,
  },
  rightIcon: {
    fontSize: '1.1rem',
  },
});

const BINARY_STAR_FSM_INVERTED = invert(BinaryStarFsmStateValueMap);
const FETCH_SERVICE_AVAILABILITY_INTERVAL_MS = 5000;

type Props = {
  networkConfig: NetworkConfig,
  networkLinkHealth: NetworkHealth,
  expanded: boolean,
  onPanelChange: () => void,
  onViewIgnitionState: () => void,
  onViewAccessPointList: () => void,
  classes: {[string]: string},
  t: (string, string) => string,
};

type State = {
  cnAvailability: ?number,
  dnAvailability: ?number,
  allAvailability: ?number,
  availabilityConfigOpen: ?boolean,
};

// allow switching between stats backends
const STATS_DS =
  window?.CONFIG?.env?.STATS_BACKEND === 'prometheus'
    ? 'prometheus'
    : 'beringei';

class OverviewPanel extends React.Component<Props, State> {
  _serviceAvailabilityInterval: IntervalID;
  state = {
    cnAvailability: null,
    dnAvailability: null,
    allAvailability: null,
    availabilityConfigOpen: false,
  };

  componentDidMount() {
    if (isFeatureEnabled('SERVICE_AVAILABILITY_ENABLED')) {
      this.fetchServiceAvailability();

      this._serviceAvailabilityInterval = setInterval(
        this.fetchServiceAvailability,
        FETCH_SERVICE_AVAILABILITY_INTERVAL_MS,
      );
    }
  }

  componentWillUnmount() {
    if (isFeatureEnabled('SERVICE_AVAILABILITY_ENABLED')) {
      // Clear timers
      clearInterval(this._serviceAvailabilityInterval);
    }
  }

  fetchServiceAvailability = () => {
    const metricName = 'pinger_lossRatio';
    const topologyName = this.props.networkConfig.topology.name;
    const intervalSec = 1;

    const cnQuery = avg(
      avgOverTime(
        createQuery(metricName, {topologyName, intervalSec, cn: 'true'}),
        '24h',
      ),
    );

    const dnQuery = avg(
      avgOverTime(
        createQuery(metricName, {topologyName, intervalSec, cn: 'false'}),
        '24h',
      ),
    );

    const allQuery = avg(
      avgOverTime(createQuery(metricName, {topologyName, intervalSec}), '24h'),
    );

    Promise.all([
      queryLatest(cnQuery),
      queryLatest(dnQuery),
      queryLatest(allQuery),
    ]).then(results => {
      this.setState(this.computeServiceAvailability(results));
    });
  };

  computeServiceAvailability(results) {
    const [cnData, dnData, allData] = results;

    return {
      cnAvailability: 100 * (1 - cnData.data.data.result?.[0]?.value?.[1]),
      dnAvailability: 100 * (1 - dnData.data.data.result?.[0]?.value?.[1]),
      allAvailability: 100 * (1 - allData.data.data.result?.[0]?.value?.[1]),
    };
  }

  renderSoftwareVersions() {
    // Render information about software versions
    const {classes, networkConfig} = this.props;
    const {status_dump, topology} = networkConfig;

    // Count software versions
    const versionCounts = {};
    let totalReported = 0;
    topology.nodes.forEach(node => {
      if (has(status_dump, ['statusReports', node.mac_addr, 'version'])) {
        const version = status_dump.statusReports[node.mac_addr].version;
        if (!versionCounts.hasOwnProperty(version)) {
          versionCounts[version] = 0;
        }
        versionCounts[version]++;
        totalReported++;
      }
    });

    return (
      <>
        <Text i18nKey="software_versions" variant="h6" gutterBottom>
          Software Versions
        </Text>

        <Text i18nKey="controller" variant="subtitle2">
          Controller
        </Text>
        <div className={classes.indented}>
          <Typography gutterBottom variant="body2">
            <em>
              {networkConfig.controller_version
                ? shortenVersionString(networkConfig.controller_version)
                : 'Unknown'}
            </em>
          </Typography>
        </div>

        {totalReported ? (
          <>
            <Text i18nKey="nodes" variant="subtitle2">
              Nodes
            </Text>
            <div className={classes.indented}>
              <table>
                <tbody>
                  {Object.keys(versionCounts).map(version => {
                    const count = versionCounts[version];
                    return (
                      <tr key={version}>
                        <td>
                          <Typography gutterBottom variant="body2">
                            <em>{shortenVersionString(version)}</em>
                          </Typography>
                        </td>
                        <td className={classes.tdRight}>
                          <Typography variant="subtitle2" gutterBottom>
                            {formatNumber(count)} (
                            {formatNumber((count / totalReported) * 100, 0)}%)
                          </Typography>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        ) : null}
      </>
    );
  }

  computeAvailability(topology, networkLinkHealth) {
    // Compute link availability percentages
    const linkHealth = networkLinkHealth.events || {};
    // Count each node type
    const nodeTypes: {[number]: number} = {};
    const nodeToNodeType = {};
    topology.nodes.forEach(node => {
      if (!nodeTypes.hasOwnProperty(node.node_type)) {
        nodeTypes[node.node_type] = 0;
      }
      nodeTypes[node.node_type]++;
      nodeToNodeType[node.name] = node.node_type;
    });

    // Split availability metrics by DN/CN links
    const allAlivePercByNodeType = {};
    let alivePercAvg = 0;
    let wirelessLinksCount = 0;
    topology.links.forEach(link => {
      // Skip wired links
      if (link.link_type !== LinkType.WIRELESS) {
        return;
      }

      // Skip links where MAC address is not defined on both sides
      if (!link.a_node_mac || !link.z_node_mac) {
        return;
      }
      // Read the availability metric
      let alivePerc = NaN;
      if (linkHealth.hasOwnProperty(link.name)) {
        alivePerc = linkHealth[link.name].linkAvailForData || NaN;
      }

      // Link availability by node type
      const nodeType =
        nodeToNodeType[link.a_node_name] == NodeType.CN ||
        nodeToNodeType[link.z_node_name] == NodeType.CN
          ? NodeType.CN
          : NodeType.DN;
      if (!allAlivePercByNodeType.hasOwnProperty(nodeType)) {
        allAlivePercByNodeType[nodeType] = [];
      }
      allAlivePercByNodeType[nodeType].push(alivePerc);

      // Global link availability
      if (!isNaN(alivePerc)) {
        alivePercAvg += alivePerc;
        wirelessLinksCount++;
      }
    });

    // Calculate average availability
    if (wirelessLinksCount > 0) {
      alivePercAvg /= wirelessLinksCount;
    }

    // Calculate per-type availability
    const alivePercByNodeType = Object.keys(nodeTypes).map((nodeType: any) => {
      let nodeTypeName = '(Unknown)';
      if (nodeType == NodeType.CN) {
        nodeTypeName = 'CN';
      } else if (nodeType == NodeType.DN) {
        nodeTypeName = 'DN';
      }

      let alivePerc = NaN;
      if (allAlivePercByNodeType.hasOwnProperty(nodeType)) {
        // Filter nodes without an availability stat
        const alivePercs = allAlivePercByNodeType[nodeType].filter(
          perc => !isNaN(perc),
        );
        if (alivePercs) {
          // Sum all individual availabilities
          alivePerc = alivePercs.reduce((a, b) => a + b, 0);
          // Divide by number of links
          alivePerc /= alivePercs.length;
        }
      }
      return {nodeTypeName, alivePerc};
    });

    return {alivePercAvg, alivePercByNodeType, wirelessLinksCount};
  }

  renderLinkAvailability() {
    const {networkConfig, networkLinkHealth} = this.props;
    const {topology} = networkConfig;
    const availability = this.computeAvailability(topology, networkLinkHealth);

    if (!availability.wirelessLinksCount) {
      return null;
    } else {
      return availability.alivePercByNodeType.map(
        ({nodeTypeName, alivePerc}, i) => {
          return (
            <React.Fragment key={nodeTypeName}>
              {nodeTypeName}{' '}
              {renderAvailabilityWithColor(formatNumberFixed(alivePerc))}
              {i < availability.alivePercByNodeType.length - 1 ? ' • ' : null}
            </React.Fragment>
          );
        },
      );
    }
  }

  renderServiceAvailability() {
    const {cnAvailability, dnAvailability} = this.state;
    const arr = [];

    if (!isNaN(cnAvailability)) {
      arr.push({
        nodeTypeName: 'CN',
        span: renderAvailabilityWithColor(formatNumberFixed(cnAvailability)),
      });
    }

    if (!isNaN(dnAvailability)) {
      arr.push({
        nodeTypeName: 'DN',
        span: renderAvailabilityWithColor(formatNumberFixed(dnAvailability)),
      });
    }

    return arr.length === 0
      ? null
      : arr.map((avail, i) => {
          return (
            <React.Fragment key={avail.nodeTypeName}>
              {avail.nodeTypeName} {avail.span}
              {i < arr.length - 1 ? ' • ' : null}
            </React.Fragment>
          );
        });
  }

  handleCloseAvailabilityConfig = () => {
    this.setState({availabilityConfigOpen: !this.state.availabilityConfigOpen});
  };

  renderAvailabilityConfig = context => {
    const {availabilityConfigOpen} = this.state;
    const {classes} = this.props;

    return (
      <span>
        <IconButton
          classes={{root: classes.rightIconButton}}
          onClick={() => {
            this.setState({availabilityConfigOpen: !availabilityConfigOpen});
          }}>
          <SettingsIcon classes={{root: classes.rightIcon}} />
        </IconButton>
        <MaterialModal
          modalTitle={this.props.t(
            'availability_config',
            'Availability Config',
          )}
          modalContent={
            <div>
              <Text i18nKey="time_window">Time Window</Text>
              {TIME_WINDOWS.map(({hours, title}) => (
                <Button
                  className={
                    hours === context.networkHealthTimeWindowHrs
                      ? classes.buttonSelected
                      : classes.button
                  }
                  key={hours}
                  variant="outlined"
                  onClick={() => {
                    context.setAvailabilityWindow(hours);
                    this.handleCloseAvailabilityConfig();
                  }}>
                  {this.props.t('' + title, '' + title)}
                </Button>
              ))}
            </div>
          }
          open={availabilityConfigOpen}
          onClose={this.handleCloseAvailabilityConfig}
          modalActions={
            <div>
              <Button
                className={classes.button}
                variant="outlined"
                onClick={this.handleCloseAvailabilityConfig}>
                <Text i18nKey="close">Close</Text>
              </Button>
            </div>
          }
        />
      </span>
    );
  };

  renderNetworkStatus(context) {
    // Render information about network status
    const {
      classes,
      networkConfig,
      networkLinkHealth,
      onViewIgnitionState,
      onViewAccessPointList,
    } = this.props;
    const {
      topology,
      wireless_controller,
      wireless_controller_stats,
    } = networkConfig;
    const {igParams} = networkConfig.ignition_state;
    const {allAvailability} = this.state;

    // Compute data
    const linksOnline = topology.links.filter(
      link => link.link_type == LinkType.WIRELESS && link.is_alive,
    ).length;
    const linksWireless = topology.links.filter(
      link => link.link_type == LinkType.WIRELESS,
    ).length;
    const sectorsOnline = topology.nodes.filter(node =>
      isNodeAlive(node.status),
    ).length;
    const availability = this.computeAvailability(topology, networkLinkHealth);

    // Count WAPs/clients (if wireless controller is defined)
    let totalWirelessAps = 0;
    let totalWirelessClients = 0;
    if (wireless_controller && wireless_controller_stats) {
      Object.values(wireless_controller_stats).forEach((val: any) => {
        totalWirelessAps++;
        // cast because flow can't handle object.values
        const wapStats: WirelessControllerStats = val;
        totalWirelessClients += wapStats.clientCount;
      });
    }
    // Ignition state
    const ignitionEnabled = igParams.enable;
    const anyLinkIgnitionOff = Object.values(igParams.linkAutoIgnite).includes(
      false,
    );

    return (
      <>
        <Text i18nKey="network" variant="h6" gutterBottom>
          Network
        </Text>

        <div className={classes.spaceBetween}>
          <Typography variant="subtitle2">
            {this.props.t('link_availability', 'Link Availability')} (
            {TIME_WINDOWS.filter(
              ({hours}) => hours === context.networkHealthTimeWindowHrs,
            ).map(({title}) => title)}
            )
          </Typography>
          <Typography variant="body2" style={{color: 'grey'}}>
            {availability.wirelessLinksCount
              ? renderAvailabilityWithColor(
                  formatNumber(availability.alivePercAvg),
                )
              : '-'}
          </Typography>

          {STATS_DS === 'prometheus' && this.renderAvailabilityConfig(context)}
        </div>

        <div className={classes.indented}>
          <div className={classes.spaceBetween}>
            <Typography variant="body2">
              {this.renderLinkAvailability()}
            </Typography>
          </div>
        </div>

        {isFeatureEnabled('SERVICE_AVAILABILITY_ENABLED') ? (
          <>
            <div className={classes.sectionSpacer} />
            <div className={classes.spaceBetween}>
              <Text i18nKey="service_availability" variant="subtitle2">
                Service Availability
              </Text>
              <Typography variant="body2">
                {renderAvailabilityWithColor(formatNumber(allAvailability))}
              </Typography>
            </div>
            <div className={classes.indented}>
              <div className={classes.spaceBetween}>
                <Typography variant="body2">
                  {this.renderServiceAvailability()}
                </Typography>
              </div>
            </div>
          </>
        ) : null}

        <div className={classes.sectionSpacer} />

        <Text i18nKey="topology" variant="subtitle2">
          Topology
        </Text>
        <div className={classes.spaceBetween}>
          <Typography variant="subtitle2">
            {getNodeIcon({classes: {root: classes.iconCentered}})}
            {this.props.t('sectors_online', 'Sectors Online')}
          </Typography>
          <Typography className={classes.vCenter}>
            {formatNumber(sectorsOnline)} /{' '}
            {formatNumber(topology.nodes.length)}
          </Typography>
        </div>
        <div className={classes.spaceBetween}>
          <Typography variant="subtitle2">
            {getLinkIcon({classes: {root: classes.iconCentered}})}
            {this.props.t('rf_links_online', 'RF Links Online')}
          </Typography>
          <Typography className={classes.vCenter}>
            {formatNumber(linksOnline)} / {formatNumber(linksWireless)}
          </Typography>
        </div>
        <div className={classes.spaceBetween}>
          <Typography variant="subtitle2">
            {getSiteIcon({classes: {root: classes.iconCentered}})}
            {this.props.t('total_sites', 'Total Sites')}
          </Typography>
          <Typography className={classes.vCenter}>
            {formatNumber(topology.sites.length)}
          </Typography>
        </div>

        {wireless_controller ? (
          <>
            <div className={classes.sectionSpacer} />

            <div className={classes.spaceBetween}>
              <Text i18nKey="access_points" variant="subtitle2">
                Access Points
              </Text>
              <IconButton
                classes={{root: classes.rightIconButton}}
                onClick={onViewAccessPointList}>
                <ListIcon classes={{root: classes.rightIcon}} />
              </IconButton>
            </div>
            <div className={classes.spaceBetween}>
              <Typography variant="subtitle2">
                {<WifiIcon classes={{root: classes.iconCentered}} />}
                {toTitleCase(wireless_controller.type)} APs
              </Typography>
              <Typography className={classes.vCenter}>
                {formatNumber(totalWirelessAps)}
              </Typography>
            </div>
            <div className={classes.spaceBetween}>
              <Typography variant="subtitle2">
                {<PersonIcon classes={{root: classes.iconCentered}} />}
                {this.props.t('total_clients', 'Total Clients')}
              </Typography>
              <Typography className={classes.vCenter}>
                {formatNumber(totalWirelessClients)}
              </Typography>
            </div>
          </>
        ) : null}

        <div className={classes.sectionSpacer} />

        <div className={classes.spaceBetween}>
          <Text i18nKey="ignition_state" variant="subtitle2">
            Ignition State
          </Text>
          <IconButton
            classes={{root: classes.rightIconButton}}
            onClick={onViewIgnitionState}>
            <SettingsIcon classes={{root: classes.rightIcon}} />
          </IconButton>
        </div>
        <div className={classes.indented}>
          <Typography variant="body2">
            Network ignition is{' '}
            <StatusText
              status={ignitionEnabled}
              trueText={anyLinkIgnitionOff ? 'partially enabled' : 'enabled'}
              falseText="disabled"
            />
            .
          </Typography>
        </div>
      </>
    );
  }

  renderServices() {
    // Render information about management-level services
    const {classes, networkConfig} = this.props;
    const {high_availability, primary, backup} = networkConfig;

    const highAvailabilityEnabled = high_availability.primary?.state !== 0;
    const haOfflineText = (
      <>
        {' \u2014 '}
        <span className={classes.errorText}>
          {this.props.t('offline', 'Offline')}
        </span>
      </>
    );

    return (
      <>
        <Text i18nKey="services" variant="h6" gutterBottom>
          Services
        </Text>

        <div className={classes.spaceBetween}>
          <Text i18nKey="controller" variant="subtitle2" gutterBottom>
            Controller
          </Text>
          <Typography
            variant="subtitle2"
            gutterBottom
            data-testid="controller-status">
            <StatusText status={networkConfig.controller_online} />
          </Typography>
        </div>
        <div className={classes.indented}>
          {networkConfig.hasOwnProperty('controller_error') ? (
            <Typography
              className={classes.errorText}
              gutterBottom
              variant="body2">
              {networkConfig.controller_error}
            </Typography>
          ) : null}
          {highAvailabilityEnabled ? (
            <>
              <div className={classes.spaceBetween}>
                <span>
                  <Typography variant="subtitle2">
                    {this.props.t('primary', 'Primary')}
                    {!primary.controller_online ? haOfflineText : null}
                  </Typography>
                </span>
                <Typography variant="body2">
                  <em>
                    {high_availability.primary &&
                      high_availability.primary.state && (
                        <HAState state={high_availability.primary.state} />
                      )}
                  </em>
                </Typography>
              </div>
              <Typography gutterBottom variant="body2">
                {primary.api_ip}
              </Typography>
              <div className={classes.spaceBetween}>
                <Typography variant="subtitle2">
                  {this.props.t('backup', 'Backup')}
                  {!backup.controller_online && backup.api_ip
                    ? haOfflineText
                    : null}
                </Typography>
                <Typography variant="body2">
                  <em>
                    {(high_availability.backup &&
                      high_availability.backup.state && (
                        <HAState state={high_availability.backup.state} />
                      )) ||
                      null}
                  </em>
                </Typography>
              </div>
              {backup.api_ip ? (
                <Typography gutterBottom variant="body2">
                  {backup.api_ip}
                </Typography>
              ) : null}
            </>
          ) : (
            <Typography gutterBottom variant="body2">
              {primary.api_ip}
            </Typography>
          )}
        </div>
        <div className={classes.spaceBetween}>
          <Text i18nKey="query_service" variant="subtitle2" gutterBottom>
            Query Service
          </Text>
          <Typography
            variant="subtitle2"
            gutterBottom
            data-testid="queryservice-status">
            <StatusText status={networkConfig.query_service_online} />
          </Typography>
        </div>
      </>
    );
  }

  renderOverview(context) {
    const {classes} = this.props;
    return (
      <div style={{width: '100%'}}>
        {this.renderNetworkStatus(context)}
        <div className={classes.sectionSpacer} />
        {this.renderServices()}
        <div className={classes.sectionSpacer} />
        {this.renderSoftwareVersions()}
      </div>
    );
  }

  render() {
    return (
      <NetworkContext.Consumer>{this.renderContext}</NetworkContext.Consumer>
    );
  }

  renderContext = context => {
    const {expanded, onPanelChange} = this.props;

    return (
      <CustomExpansionPanel
        title={this.props.t('overview', 'Overview')}
        details={this.renderOverview(context)}
        expanded={expanded}
        onChange={onPanelChange}
      />
    );
  };
}

function HAState({state}: {state: ControllerHAState}) {
  if (!state) {
    return 'Unknown';
  }

  return (
    <FriendlyText
      disableTypography
      text={BINARY_STAR_FSM_INVERTED[state]}
      separator="_"
      stripPrefix="STATE"
    />
  );
}

OverviewPanel.propTypes = {
  classes: PropTypes.object.isRequired,
  expanded: PropTypes.bool.isRequired,
  onPanelChange: PropTypes.func.isRequired,
  networkConfig: PropTypes.object.isRequired,
  networkLinkHealth: PropTypes.object.isRequired,
  onViewIgnitionState: PropTypes.func.isRequired,
  onViewAccessPointList: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default withStyles(styles)(withTranslation()(OverviewPanel));
