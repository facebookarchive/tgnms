/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow
 */

import * as React from 'react';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import {BUTTON_TYPES} from '../../constants/ScheduleConstants';
import {makeStyles} from '@material-ui/styles';

import type {TableResultType} from '../../views/network_test/NetworkTestTypes';

const useStyles = makeStyles(theme => ({
  scheduleActionButtonContainer: {
    marginLeft: -theme.spacing(1),
  },
  menuItems: {
    textTransform: 'uppercase',
    fontSize: theme.typography.fontSize,
    fontWeight: 500,
  },
  editMenuItem: {
    marginLeft: -theme.spacing(2),
    paddingBottom: 0,
    paddingTop: 0,
  },
}));

type Props = {
  editButton: React.Node,
  onDeleteSchedule: number => void,
  onSetDisableSchedule: number => Promise<void>,
  row: TableResultType,
};

export default function ScheduleActions(props: Props) {
  const {editButton, onDeleteSchedule, onSetDisableSchedule, row} = props;
  const [anchorEl, setAnchorEl] = React.useState(null);
  const classes = useStyles();

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDisable = () => {
    onSetDisableSchedule(row.id);
    handleClose();
  };

  const handleDelete = () => {
    onDeleteSchedule(row.id);
    handleClose();
  };

  return (
    <div className={classes.scheduleActionButtonContainer}>
      <Button onClick={handleClick}>
        View Actions <ArrowDropDownIcon />
      </Button>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}>
        <MenuItem onClick={handleClose} className={classes.editMenuItem}>
          {editButton}
        </MenuItem>
        <MenuItem onClick={handleDisable} className={classes.menuItems}>
          {row.enabled ? BUTTON_TYPES.disable : BUTTON_TYPES.enable}
        </MenuItem>
        <MenuItem onClick={handleDelete} className={classes.menuItems}>
          {BUTTON_TYPES.delete}
        </MenuItem>
      </Menu>
    </div>
  );
}
