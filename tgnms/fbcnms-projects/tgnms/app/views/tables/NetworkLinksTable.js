/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 */
'use strict';

import Checkbox from '@material-ui/core/Checkbox';
import CustomTable from '../../components/common/CustomTable';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import FormLabel from '@material-ui/core/FormLabel';
import NetworkContext from '../../NetworkContext';
import PropTypes from 'prop-types';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import React from 'react';
import ReactPlotlyEventChart from './ReactPlotlyEventChart';
import {LinkType, NodeType} from '../../../thrift/gen-nodejs/Topology_types';
import {SortDirection} from 'react-virtualized';
import {TopologyElementType} from '../../constants/NetworkConstants.js';
import {availabilityColor} from '../../helpers/NetworkHelpers';
import {formatNumber} from '../../helpers/StringHelpers';
import {renderDashboardLink} from './FbInternal';
import {renderStatusColor} from '../../helpers/TableHelpers';
import {withStyles} from '@material-ui/core/styles';

// Invalid analyzer value, ignore any fields that have this value.
const INVALID_VALUE = 255;

const styles = theme => {
  return {
    button: {
      marginLeft: theme.spacing.unit,
      marginRight: theme.spacing.unit,
    },
    tableOptions: {
      padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    },
    tableContainer: {},
  };
};

const LinkTable = {
  DEFAULT: 'DEFAULT',
  EVENTS_CHART: 'EVENTS_CHART',
  ANALYZER: 'ANALYZER',
};

class NetworkLinksTable extends React.Component {
  state = {
    // Selected element (derived from NetworkContext)
    selectedLink: null,
    topLink: null,
    keepTopLink: false,

    // Link filters
    hideDnToDnLinks: false,
    hideWired: true,

    // Keep track of current sort state
    sortBy: 'name',
    sortDirection: SortDirection.ASC,

    // The type of link table to display
    linkTable: LinkTable.EVENTS_CHART,
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    // Update selected row
    const {selectedElement} = nextProps.context;
    if (selectedElement && selectedElement.type === TopologyElementType.LINK) {
      if (prevState.selectedLink !== selectedElement.name) {
        // TODO - HACK! - When selecting a row, don't change topLink
        // (only change it when another component sets the state)
        if (prevState.keepTopLink) {
          return {
            selectedLink: selectedElement.name,
            keepTopLink: false,
          };
        } else {
          return {
            selectedLink: selectedElement.name,
            topLink: selectedElement.name,
          };
        }
      }
      return {};
    } else {
      return {selectedLink: null, topLink: null};
    }
  }

  eventChartColumns = [
    {
      filter: true,
      isKey: true,
      key: 'name',
      label: 'Name',
      render: this.renderLinkName.bind(this),
      sort: true,
      sortFunc: this.linkSortFunc.bind(this),
      width: 300,
    },
    {
      key: 'alive',
      label: 'Alive?',
      render: renderStatusColor,
      sort: true,
      width: 100,
    },
    {
      key: 'alive_perc',
      label: 'Uptime (24hr)',
      render: this.renderAlivePerc.bind(this),
      sort: true,
      width: 120,
    },
    {
      key: 'avail_perc',
      label: 'Availability (24hr)',
      render: this.renderAlivePerc.bind(this),
      sort: true,
      width: 120,
    },
    {
      key: 'availability_chart',
      label: 'Uptime/Availability (24hr)',
      render: this.renderLinkAvailability.bind(this),
      sort: true,
      width: 810,
    },
    {
      key: 'linkup_attempts',
      label: 'Ignition Attempts',
      sort: true,
      width: 100,
    },
    {
      key: 'distance',
      label: 'Distance (m)',
      render: this.renderDistance.bind(this),
      sort: true,
      width: 120,
    },
  ];

  analyzerChartColumns = [
    {
      filter: true,
      isKey: true,
      key: 'name',
      label: 'Name',
      render: renderDashboardLink.bind(this),
      sort: true,
      sortFunc: this.linkSortFunc.bind(this),
      width: 350,
    },
    {
      filter: true,
      key: 'a_node_name',
      label: 'A-Node',
      sort: true,
      width: 140,
    },
    {
      filter: true,
      key: 'z_node_name',
      label: 'Z-Node',
      sort: true,
      width: 140,
    },
    {
      key: 'alive',
      label: 'Alive',
      render: renderStatusColor,
      sort: true,
      width: 100,
    },
    {
      key: 'mcs',
      label: 'Avg MCS',
      render: cell => this.renderFloatPoint('mcs', cell),
      sort: true,
      width: 100,
    },
    {
      key: 'snr',
      label: 'Avg SNR',
      render: cell => this.renderFloatPoint('snr', cell),
      sort: true,
      width: 100,
    },
    {
      key: 'per',
      label: 'Avg PER',
      render: cell => this.renderFloatPoint('per', cell),
      sort: true,
      width: 100,
    },
    {
      key: 'tput',
      label: 'Avg tput(PPS)',
      render: cell => this.renderFloatPoint('tput', cell),
      sort: true,
      width: 100,
    },
    {
      key: 'txpower',
      label: 'Avg txPower',
      render: cell => this.renderFloatPoint('txpower', cell),
      sort: true,
      width: 100,
    },
    {
      key: 'fw_restarts',
      label: '#Restarts',
      render: cell => this.renderFloatPoint('fw_restarts', cell),
      sort: true,
      width: 100,
    },
    {
      label: 'Uptime',
      key: 'uptime',
      render: cell => this.renderFloatPoint('uptime', cell),
      sort: true,
      width: 100,
    },
    {
      key: 'distance',
      label: 'Distance (m)',
      render: this.renderDistance.bind(this),
      sort: true,
      width: 120,
    },
  ];

  defaultChartColumns = [
    {
      filter: true,
      isKey: true,
      key: 'name',
      label: 'Name',
      sort: true,
      sortFunc: this.linkSortFunc.bind(this),
      width: 300,
    },
    {filter: true, key: 'a_node_name', label: 'A-Node', width: 180},
    {filter: true, key: 'z_node_name', label: 'Z-Node', width: 180},
    {
      key: 'alive',
      label: 'Alive',
      render: renderStatusColor,
      sort: true,
      width: 100,
    },
    {
      key: 'alive_perc',
      label: 'Uptime (24hr)',
      render: this.renderAlivePerc.bind(this),
      sort: true,
      width: 140,
    },
    {key: 'type', label: 'Type', width: 100},
    {
      key: 'linkup_attempts',
      label: 'Ignition Attempts',
      sort: true,
      width: 100,
    },
    {
      key: 'distance',
      label: 'Distance (m)',
      render: this.renderDistance.bind(this),
      sort: true,
      width: 120,
    },
  ];

  rowHeight = 80;
  headerHeight = 80;
  overscanRowCount = 10;

  linkSortFuncHelper(a, b, order) {
    if (order === SortDirection.DESC) {
      if (a.name > b.name) {
        return -1;
      } else if (a.name < b.name) {
        return 1;
      }
      // both entries have the same name, sort based on a/z node name
      if (a.a_node_name > a.z_node_name) {
        return -1;
      } else {
        return 1;
      }
    } else {
      if (a.name < b.name) {
        return -1;
      } else if (a.name > b.name) {
        return 1;
      }
      // both entries have the same name, sort based on a/z node name
      if (a.a_node_name < a.z_node_name) {
        return -1;
      } else {
        return 1;
      }
    }
  }

  linkSortFunc(a, b, order) {
    // order is desc or asc
    const {topLink} = this.state;
    if (topLink) {
      // Move selected link to the top
      if (a.name === topLink) {
        if (a.name === b.name) {
          return this.linkSortFuncHelper(a, b, order);
        } else {
          return -1;
        }
      } else if (b.name === topLink) {
        if (a.name === b.name) {
          return this.linkSortFuncHelper(a, b, order);
        } else {
          return 1;
        }
      }
    }
    return this.linkSortFuncHelper(a, b, order);
  }

  formatAnalyzerValue(obj, propertyName) {
    return obj.hasOwnProperty(propertyName)
      ? obj[propertyName] === INVALID_VALUE
        ? '-'
        : obj[propertyName]
      : '-';
  }

  getTableRows(
    context,
  ): Array<{
    name: string,
    a_node_name: string,
    z_node_name: string,
    alive: boolean,
  }> {
    const rows = [];
    Object.keys(context.linkMap).forEach(linkName => {
      const link = context.linkMap[linkName];
      let alivePerc = null;
      let availPerc = null;
      if (
        context.networkLinkHealth &&
        context.networkLinkHealth.hasOwnProperty('events') &&
        context.networkLinkHealth.events.hasOwnProperty(link.name)
      ) {
        const linkHealth = context.networkLinkHealth.events[link.name];
        alivePerc = linkHealth.linkAlive;
        availPerc = linkHealth.linkAvailForData || NaN;
      }

      const linkupAttempts = link.linkup_attempts || 0;
      if (link.link_type === LinkType.ETHERNET && this.state.hideWired) {
        return;
      }
      // check if either side of the node is a CN
      if (
        !context.nodeMap.hasOwnProperty(link.a_node_name) ||
        !context.nodeMap.hasOwnProperty(link.z_node_name)
      ) {
        return;
      }
      const aNode = context.nodeMap[link.a_node_name];
      const zNode = context.nodeMap[link.z_node_name];
      if (
        this.state.hideDnToDnLinks &&
        aNode.node_type === NodeType.DN &&
        zNode.node_type === NodeType.DN
      ) {
        // skip since it's DN to DN
        return;
      }
      rows.push({
        a_node_name: link.a_node_name,
        alive: link.is_alive,
        alive_perc: alivePerc,
        avail_perc: availPerc,
        distance: link._meta_.distance,
        linkup_attempts: linkupAttempts,
        name: link.name,
        type: link.link_type === LinkType.WIRELESS ? 'Wireless' : 'Wired',
        z_node_name: link.z_node_name,
      });
    });
    return rows;
  }

  getTableRowsAnalyzer(
    context,
  ): Array<{
    name: string,
    a_node_name: string,
    z_node_name: string,
    alive: boolean,
  }> {
    const rows = [];

    if (!context.linkMap) {
      return rows;
    }
    Object.keys(context.linkMap).forEach(linkName => {
      const link = context.linkMap[linkName];
      let alivePerc = null;
      if (
        context.networkLinkHealth &&
        context.networkLinkHealth.hasOwnProperty('events') &&
        context.networkLinkHealth.events.hasOwnProperty(link.name)
      ) {
        const linkHealth = context.networkLinkHealth.events[link.name];
        alivePerc = linkHealth.linkAlive;
      }

      if (!context.networkAnalyzerData) {
        return;
      }
      const analyzerLink = context.networkAnalyzerData.hasOwnProperty(linkName)
        ? context.networkAnalyzerData[linkName]
        : {};
      const analyzerLinkA = analyzerLink.hasOwnProperty('A')
        ? analyzerLink.A
        : analyzerLink;
      const analyzerLinkZ = analyzerLink.hasOwnProperty('Z')
        ? analyzerLink.Z
        : analyzerLink;
      if (link.link_type == LinkType.ETHERNET && this.state.hideWired) {
        return;
      }
      // check if either side of the node is a CN
      if (
        !context.nodeMap.hasOwnProperty(link.a_node_name) ||
        !context.nodeMap.hasOwnProperty(link.z_node_name)
      ) {
        return;
      }
      const aNode = context.nodeMap[link.a_node_name];
      const zNode = context.nodeMap[link.z_node_name];
      if (
        this.state.hideDnToDnLinks &&
        aNode.node_type === NodeType.DN &&
        zNode.node_type === NodeType.DN
      ) {
        // skip since it's DN to DN
        return;
      }

      // this is the A->Z link
      rows.push({
        name: link.name,
        a_node_name: link.a_node_name,
        z_node_name: link.z_node_name,
        alive: link.is_alive,
        alive_perc: alivePerc,
        fw_restarts: analyzerLinkA.flaps,
        uptime: analyzerLinkA.uptime,
        mcs: this.formatAnalyzerValue(analyzerLinkA, 'avg_mcs'),
        // snr is the receive signal strength which needs to come from the
        // other side of the link
        snr: this.formatAnalyzerValue(analyzerLinkZ, 'avg_snr'),
        per: this.formatAnalyzerValue(analyzerLinkA, 'avg_per'),
        tput: this.formatAnalyzerValue(analyzerLinkA, 'avg_tput'),
        txpower: this.formatAnalyzerValue(analyzerLinkA, 'avg_tx_power'),
        distance: link._meta_.distance,
      });
      // this is the Z->A link
      rows.push({
        name: link.name,
        a_node_name: link.z_node_name,
        z_node_name: link.a_node_name,
        alive: link.is_alive,
        alive_perc: alivePerc,
        fw_restarts: analyzerLinkA.flaps,
        uptime: analyzerLinkA.uptime,
        mcs: this.formatAnalyzerValue(analyzerLinkZ, 'avg_mcs'),
        // snr is the receive signal strength which needs to come from the
        // other side of the link
        snr: this.formatAnalyzerValue(analyzerLinkA, 'avg_snr'),
        per: this.formatAnalyzerValue(analyzerLinkZ, 'avg_per'),
        tput: this.formatAnalyzerValue(analyzerLinkZ, 'avg_tput'),
        txpower: this.formatAnalyzerValue(analyzerLinkZ, 'avg_tx_power'),
        distance: link._meta_.distance,
      });
    });
    return rows;
  }

  tableOnRowSelect = row => {
    // Select a row
    const {context} = this.props;
    this.setState({keepTopLink: true}, () =>
      context.setSelected(TopologyElementType.LINK, row.name),
    );
  };

  renderLinkName(cell, _row) {
    return <span>{cell}</span>;
  }

  renderAlivePerc(cell, row) {
    let cellColor = 'red';
    let cellText = '-';
    if (row.type === 'Wired') {
      // color wired links as unavailable
      cellColor = 'grey';
      cellText = 'X';
    } else if (cell) {
      cellText = formatNumber(cell, 2);
      cellColor = availabilityColor(cellText);
    }
    return <span style={{color: cellColor}}>{'' + cellText}</span>;
  }

  renderDistance(cell, _row) {
    return <span>{formatNumber(cell, 1)}</span>;
  }

  variableColorUp(value, thresh1, thresh2) {
    if (value >= thresh1) {
      return 'green';
    } else if (value >= thresh2) {
      return 'orange';
    } else {
      return 'red';
    }
  }

  variableColorDown(value, thresh1, thresh2) {
    if (value <= thresh1) {
      return 'green';
    } else if (value <= thresh2) {
      return 'orange';
    } else {
      return 'red';
    }
  }

  // round and set color
  renderFloatPoint = (tpxx, cell, _row) => {
    let cellColor = 'red';
    let cellText = '-';
    if (!isNaN(cell)) {
      switch (tpxx) {
        case 'mcs':
          if (cell === 254) {
            cellText = 'N/A';
            cellColor = 'black';
          } else {
            cellText = formatNumber(cell, 1);
            // if value>thresh1 green, elseif >thresh2 orange, else red
            cellColor = this.variableColorUp(cell, 9, 5);
          }
          break;
        case 'snr':
          cellText = formatNumber(cell, 1);
          cellColor = this.variableColorUp(cell, 12, 9);
          break;
        case 'txpower':
          cellText = formatNumber(cell, 1);
          cellColor = this.variableColorUp(cell, 0, 0);
          break;
        case 'tput':
          cellText = formatNumber(cell, 0);
          cellColor = this.variableColorUp(cell, 0, 0);
          break;
        case 'per':
          cellText = formatNumber(cell, 2) + '%'; //cell.toExponential(2);
          // if value<thresh1 green, elseif <thresh2 orange, else red
          cellColor = this.variableColorDown(cell, 0.5, 1);
          break;
        case 'uptime':
          cellText = formatNumber(cell, 2) + '%';
          cellColor = availabilityColor(cell);
          break;
        case 'fw_restarts':
          cellText = formatNumber(cell, 0);
          cellColor = this.variableColorDown(cell, 0, 1);
          break;
      }
    }

    return <span style={{color: cellColor}}>{'' + cellText}</span>;
  };

  renderLinkAvailability(cell, row, style) {
    if (row && row.name) {
      return (
        <NetworkContext.Consumer>
          {({linkMap, networkLinkHealth}) => {
            const link = linkMap[row.name];
            if (link) {
              const startTime = networkLinkHealth.startTime;
              const endTime = networkLinkHealth.endTime;
              if (
                networkLinkHealth.hasOwnProperty('events') &&
                networkLinkHealth.events.hasOwnProperty(link.name)
              ) {
                const linkHealth = networkLinkHealth.events[link.name];
                const events = linkHealth.events;
                if (events.length > 0) {
                  return (
                    <ReactPlotlyEventChart
                      linkName={link.name}
                      events={events}
                      startTime={startTime}
                      endTime={endTime}
                      size={'small'}
                      width={style.width - 10}
                      height={style.height - 10}
                    />
                  );
                }
              }
            }
            return null;
          }}
        </NetworkContext.Consumer>
      );
    }
    return null;
  }

  onSortChange(sortBy, sortDirection) {
    this.setState({
      sortBy,
      sortDirection,
      topLink: sortBy === 'name' ? this.state.topLink : null,
    });
  }

  renderLinksTable(context) {
    const {linkTable, sortBy, sortDirection, selectedLink} = this.state;

    let columns = this.defaultChartColumns;
    let data;
    if (linkTable === LinkTable.ANALYZER) {
      columns = this.analyzerChartColumns;
      data = this.getTableRowsAnalyzer(context);
    } else if (linkTable === LinkTable.EVENTS_CHART) {
      columns = this.eventChartColumns;
      data = this.getTableRows(context);
    } else if (linkTable === LinkTable.DEFAULT) {
      columns = this.defaultChartColumns;
      data = this.getTableRows(context);
    }

    return (
      <CustomTable
        rowHeight={this.rowHeight}
        headerHeight={this.headerHeight}
        overscanRowCount={this.overscanRowCount}
        columns={columns}
        data={data}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onRowSelect={this.tableOnRowSelect}
        onSortChange={(sortBy, sortDirection) =>
          this.onSortChange(sortBy, sortDirection)
        }
        selected={selectedLink ? [selectedLink] : []}
        additionalRenderParams={{context}}
      />
    );
  }

  render() {
    return (
      <NetworkContext.Consumer>{this.renderContext}</NetworkContext.Consumer>
    );
  }

  renderContext = context => {
    const {classes} = this.props;

    // render display with or without events chart
    const linksTable = this.renderLinksTable(context);
    return (
      <>
        <div className={classes.tableOptions}>
          <FormControl>
            <FormLabel component="legend">Link Options</FormLabel>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.hideWired}
                    onChange={event => {
                      this.setState({hideWired: event.target.checked});
                    }}
                    value="hideWired"
                    color="primary"
                  />
                }
                label="Hide Wired Links"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={this.state.hideDnToDnLinks}
                    onChange={event => {
                      this.setState({hideDnToDnLinks: event.target.checked});
                    }}
                    value="hideDnToDnLinks"
                    color="primary"
                  />
                }
                label="CNs only"
              />
            </FormGroup>
          </FormControl>
          <FormControl>
            <FormLabel component="legend">Link Table</FormLabel>
            <RadioGroup
              aria-label="Link Table"
              name="linkTable"
              value={this.state.linkTable}
              onChange={event => this.setState({linkTable: event.target.value})}
              row>
              <FormControlLabel
                value={LinkTable.DEFAULT}
                control={<Radio color="primary" />}
                label="Default"
              />
              <FormControlLabel
                value={LinkTable.EVENTS_CHART}
                control={<Radio color="primary" />}
                label="Link Events"
              />
              <FormControlLabel
                value={LinkTable.ANALYZER}
                control={<Radio color="primary" />}
                label="Link Stats"
              />
            </RadioGroup>
          </FormControl>
        </div>
        <Divider variant="middle" />
        {linksTable}
      </>
    );
  };
}

NetworkLinksTable.propTypes = {
  context: PropTypes.object.isRequired,
};

export default withStyles(styles, {withTheme: true})(NetworkLinksTable);
