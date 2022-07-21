/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import CircularProgress from '@material-ui/core/CircularProgress';
import CustomAccordion from '@fbcnms/tg-nms/app/components/common/CustomAccordion';
import InfoIcon from '@material-ui/icons/Info';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import {
  UpgradeGroupTypeValueMap as UpgradeGroupType,
  UpgradeReqTypeValueMap as UpgradeReqType,
  UpgradeStatusTypeValueMap as UpgradeStatusType,
} from '@fbcnms/tg-nms/shared/types/Controller';
import {
  getVersion,
  getVersionNumber,
} from '@fbcnms/tg-nms/app/helpers/VersionHelper';
import {withStyles} from '@material-ui/core/styles';

import type {
  NodeType as Node,
  TopologyType,
} from '@fbcnms/tg-nms/shared/types/Topology';
import type {
  StatusReportType,
  UpgradeStateDumpType,
} from '@fbcnms/tg-nms/shared/types/Controller';

// Size of CircularProgress (in px)
const PROGRESS_SIZE = 80;

const styles = theme => ({
  iconCentered: {
    verticalAlign: 'middle',
    paddingRight: theme.spacing(1),
  },
  infoText: {
    color: theme.palette.grey[700],
    lineHeight: '1rem',
    display: 'flex',
    alignItems: 'center',
    paddingBottom: theme.spacing(1),
  },
  progressWrapper: {
    position: 'relative',
    textAlign: 'center',
  },
  progressBuffer: {
    position: 'absolute',
    color: theme.palette.grey[300],
  },
  progressTextWrapper: {
    position: 'absolute',
    height: PROGRESS_SIZE,
    left: 0,
    right: 0,
  },
  progressText: {
    position: 'relative',
    top: '50%',
    transform: 'translateY(-50%)',
  },
});

type Props = {
  classes: {[string]: string},
  expanded: boolean,
  onPanelChange: () => any,
  topology: TopologyType,
  nodeMap: {[string]: Node},
  upgradeStateDump: UpgradeStateDumpType,
  statusReports: {[string]: StatusReportType},
};

class UpgradeProgressPanel extends React.Component<Props> {
  getNodesInUpgrade(topology, upgradeGroupReq) {
    // Return all nodes in the given upgrade request
    if (upgradeGroupReq.ugType === UpgradeGroupType.NODES) {
      return upgradeGroupReq.nodes;
    } else if (upgradeGroupReq.ugType === UpgradeGroupType.NETWORK) {
      const excludeSet = new Set(upgradeGroupReq.excludeNodes);
      return topology.nodes
        .filter(node => !excludeSet.has(node.name))
        .map(node => node.name);
    }
    return []; // shouldn't happen
  }

  getStatusReport(nodeName, nodeMap, statusReports) {
    // Return the status report for the given node, or null
    if (nodeMap.hasOwnProperty(nodeName)) {
      const node = nodeMap[nodeName];
      if (statusReports && statusReports.hasOwnProperty(node.mac_addr)) {
        return statusReports[node.mac_addr];
      }
    }
    return null;
  }

  isPrepared(statusReport, upgradeGroupReq) {
    // Return whether the given node is prepared
    if (statusReport) {
      const {upgradeStatus} = statusReport;
      return (
        upgradeStatus.usType === UpgradeStatusType.FLASHED &&
        upgradeStatus.nextImage.md5 === upgradeGroupReq.urReq.md5
      );
    } else {
      return false;
    }
  }

  isCommitted(statusReport, upgradeGroupReq) {
    // Return whether the given node is committed
    if (statusReport) {
      const {upgradeStatus} = statusReport;
      return (
        upgradeStatus.usType === UpgradeStatusType.NONE &&
        (!upgradeGroupReq.version ||
          upgradeGroupReq.version.trim() === statusReport.version.trim())
      );
    } else {
      return false;
    }
  }

  getUpgradeVersion(upgradeGroupReq, nodes, nodeMap, statusReports) {
    // Return the new image version
    if (upgradeGroupReq.version) {
      return upgradeGroupReq.version;
    }

    // 'version' is optional in the upgrade request
    // If omitted, find any node that reported 'nextImage'
    for (const name of nodes) {
      const statusReport = this.getStatusReport(name, nodeMap, statusReports);
      if (statusReport && statusReport.upgradeStatus.nextImage.version) {
        return statusReport.upgradeStatus.nextImage.version;
      }
    }

    return null;
  }

  renderUpgradeState() {
    // Render upgrade state
    const {
      classes,
      topology,
      nodeMap,
      upgradeStateDump,
      statusReports,
    } = this.props;
    const {curBatch, pendingBatches, curReq} = upgradeStateDump;
    const {urReq} = curReq;
    const upgradeVersion = this.getUpgradeVersion(
      curReq,
      curBatch,
      nodeMap,
      statusReports,
    );

    // Determine content based on upgrade type...
    let mainText = null;
    let isUpgradeCompleteFunc = null;
    let remainingBatches = 0;
    if (urReq.urType === UpgradeReqType.PREPARE_UPGRADE) {
      mainText = upgradeVersion
        ? 'Flashing nodes with M' +
          getVersionNumber(getVersion(upgradeVersion)) +
          '...'
        : 'Downloading new software...';
      isUpgradeCompleteFunc = this.isPrepared;
      if (curReq.limit > 0) {
        remainingBatches = pendingBatches.length + 1;
      }
    } else if (urReq.urType === UpgradeReqType.COMMIT_UPGRADE) {
      mainText = upgradeVersion
        ? 'Upgrading nodes to M' +
          getVersionNumber(getVersion(upgradeVersion)) +
          '...'
        : 'Upgrading nodes...';
      isUpgradeCompleteFunc = this.isCommitted;
      if (curReq.limit > -1) {
        remainingBatches = pendingBatches.length + 1;
      }
    } else {
      return null; // shouldn't happen
    }

    // Overall progress
    const nodesInUpgrade = this.getNodesInUpgrade(topology, curReq);
    const numNodesCompleted = nodesInUpgrade.filter(name => {
      const statusReport = this.getStatusReport(name, nodeMap, statusReports);
      const isUpgradeComplete = isUpgradeCompleteFunc
        ? isUpgradeCompleteFunc(statusReport, curReq)
        : false;
      return statusReport && isUpgradeComplete;
    }).length;
    const progressPercent =
      nodesInUpgrade.length === 0
        ? 0
        : (numNodesCompleted * 100) / nodesInUpgrade.length;

    return (
      <>
        <Typography className={classes.infoText} variant="body2">
          <InfoIcon classes={{root: classes.iconCentered}} />
          {mainText}
          {remainingBatches ? (
            <>
              <br />(
              {remainingBatches === 1
                ? '1 batch remaining'
                : remainingBatches + ' batches remaining'}
              )
            </>
          ) : null}
        </Typography>

        <div className={classes.progressWrapper}>
          {nodesInUpgrade.length ? (
            <div className={classes.progressTextWrapper}>
              <Typography className={classes.progressText} variant="body2">
                {numNodesCompleted} / {nodesInUpgrade.length}
              </Typography>
            </div>
          ) : null}

          <CircularProgress
            classes={{root: classes.progressBuffer}}
            variant="static"
            value={100}
            size={PROGRESS_SIZE}
          />
          <CircularProgress
            variant="static"
            value={progressPercent}
            size={PROGRESS_SIZE}
          />
        </div>
      </>
    );
  }

  renderPanel() {
    return <div style={{width: '100%'}}>{this.renderUpgradeState()}</div>;
  }

  render() {
    const {expanded, onPanelChange} = this.props;

    return (
      <CustomAccordion
        title="Upgrade Progress"
        details={this.renderPanel()}
        expanded={expanded}
        onChange={onPanelChange}
      />
    );
  }
}

export default withStyles(styles)(UpgradeProgressPanel);
