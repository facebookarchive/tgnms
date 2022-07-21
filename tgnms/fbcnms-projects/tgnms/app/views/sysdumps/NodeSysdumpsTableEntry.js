/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import Checkbox from '@material-ui/core/Checkbox';
import React from 'react';
import TableCell from '@material-ui/core/TableCell';
import TableRow from '@material-ui/core/TableRow';
import {SYSDUMP_PATH} from '@fbcnms/tg-nms/app/apiutils/SysdumpAPIUtil';
import type {NodeSysdumpType} from './NodeSysdumps';

type Props = {
  sysdump: NodeSysdumpType,
  onClick: Function,
  isSelected: boolean,
};

class NodeSysdumpsTableEntry extends React.Component<Props> {
  render() {
    const {sysdump, onClick, isSelected} = this.props;

    return (
      <TableRow hover onClick={onClick(sysdump.filename)} selected={isSelected}>
        <TableCell padding="checkbox">
          <Checkbox checked={isSelected} color="primary" />
        </TableCell>
        <TableCell component="th" scope="row" padding="none">
          {sysdump.filename}
        </TableCell>
        <TableCell size="small">{sysdump.date}</TableCell>
        <TableCell size="small">{sysdump.size}</TableCell>
        <TableCell
          size="small"
          numeric
          component="a"
          href={`${SYSDUMP_PATH}/download/${sysdump.filename}`}>
          Download
        </TableCell>
      </TableRow>
    );
  }
}

export default NodeSysdumpsTableEntry;
