/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 */
'use strict';

import Dispatcher from '../../NetworkDispatcher.js';
import {Actions} from '../../constants/NetworkConstants.js';
import UpgradeBatchTable from './UpgradeBatchTable.js';
import UpgradeNodesTable from './UpgradeNodesTable.js';
import UpgradeRequestsTable from './UpgradeRequestsTable.js';
import PropTypes from 'prop-types';
import {render} from 'react-dom';
import React from 'react';

export default class UpgradeMonitor extends React.Component {
  flattenPendingBatches(pendingBatches) {
    // flatten the list of node batches into a single list of nodes
    // then associate each node with the batch it belongs to (batchIdx)
    return pendingBatches.reduce((pendingNodes, batch, batchIdx) => {
      return pendingNodes.concat(
        batch.map(nodeInBatch => Object.assign({}, nodeInBatch, {batchIdx})),
      );
    }, []);
  }

  onNodesSelected(nodes) {
    Dispatcher.dispatch({
      actionType: Actions.UPGRADE_NODES_SELECTED,
      nodes,
    });
  }

  render() {
    const {
      topology,
      selectedNodes,
      curBatch,
      pendingBatches,
      pendingRequests,
    } = this.props;
    const pendingBatchNodes = this.flattenPendingBatches(pendingBatches);

    const nodes = topology && topology.nodes ? topology.nodes : [];

    return (
      <div className="rc-upgrade-monitor">
        <div className="upgrade-monitor-row">
          <label>Node Upgrade Status (Select nodes for upgrade)</label>
          <UpgradeNodesTable
            nodes={nodes}
            selectedNodes={selectedNodes}
            onNodesSelected={this.onNodesSelected}
          />
        </div>
        <div className="upgrade-monitor-row">
          <label>Nodes in current upgrade batch</label>
          <UpgradeBatchTable
            nodes={curBatch}
            height={300}
            pendingBatch={false}
          />
        </div>
        <div className="upgrade-monitor-row">
          <label>Nodes pending upgrade</label>
          <UpgradeBatchTable
            nodes={pendingBatchNodes}
            height={500}
            pendingBatch={true}
          />
        </div>
        {/* <div className='upgrade-monitor-row'>
          <label>Pending Requests</label>
          <UpgradeRequestsTable
            pendingRequests={pendingRequests}
            height={300}
            isSelectable={false}
          />
        </div> */}
      </div>
    );
  }
}

UpgradeMonitor.propTypes = {
  topology: PropTypes.object.isRequired,
  selectedNodes: PropTypes.array.isRequired,
  curBatch: PropTypes.array.isRequired,
  pendingBatches: PropTypes.array.isRequired,
  pendingRequests: PropTypes.array.isRequired,
};
