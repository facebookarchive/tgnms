/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import StatusText from '@fbcnms/tg-nms/app/components/common/StatusText';
import Typography from '@material-ui/core/Typography';
import {LinkTypeValueMap} from '@fbcnms/tg-nms/shared/types/Topology';
import {getNodeLinks} from '@fbcnms/tg-nms/app/helpers/MapPanelHelpers';
import {makeStyles} from '@material-ui/styles';

import type {
  NodeType,
  TopologyType,
} from '@fbcnms/tg-nms/shared/types/Topology';

const useStyles = makeStyles(_theme => ({
  detail: {
    overflowWrap: 'break-word',
    wordBreak: 'break-all',
  },
  spaceBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
}));

type Props = {
  node: NodeType,
  topology: TopologyType,
};

export default function NodeEthernetLinks(props: Props) {
  const classes = useStyles();
  const {node, topology} = props;
  const nodeLinks = getNodeLinks(
    node,
    topology.links,
    LinkTypeValueMap.ETHERNET,
  );
  if (nodeLinks.length < 1) {
    return null;
  }
  return (
    <div>
      <Typography variant="subtitle2">Ethernet Links</Typography>
      <div className={classes.detail}>
        {nodeLinks.map(link => {
          const remoteNodeName =
            node.name == link.a_node_name ? link.z_node_name : link.a_node_name;
          return (
            <div
              className={classes.spaceBetween}
              key={link.name}
              data-testid={remoteNodeName}>
              <Typography variant="body2">{remoteNodeName}</Typography>
              <Typography variant="body2">
                <StatusText status={link.is_alive} />
              </Typography>
            </div>
          );
        })}
      </div>
    </div>
  );
}
