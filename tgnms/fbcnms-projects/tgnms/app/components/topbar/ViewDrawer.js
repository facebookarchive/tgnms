/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow
 */

import Divider from '@material-ui/core/Divider';
import Drawer from '@material-ui/core/Drawer';
import InfoMenu from '@fbcnms/tg-nms/app/components/topbar/InfoMenu/InfoMenu';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import MUINavLink from '@fbcnms/tg-nms/app/components/topbar/MUINavLink';
import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import classNames from 'classnames';
import {CONFIG_PATH} from '@fbcnms/tg-nms/app/constants/paths';
import {NETWORKLESS_VIEW_NAME, VIEWS} from '@fbcnms/tg-nms/app/views/views';
import {generatePath} from 'react-router';
import {makeStyles} from '@material-ui/styles';
import {useNetworkListContext} from '@fbcnms/tg-nms/app/contexts/NetworkListContext';

const DRAWER_WIDTH = 240;

const useStyles = makeStyles(theme => ({
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: DRAWER_WIDTH,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  toolbar: {
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '0 0px',
    ...theme.mixins.toolbar,
  },
  drawerListItem: {
    '@media (min-width: 600px)': {
      paddingLeft: theme.spacing(3),
      paddingRight: theme.spacing(3),
    },
  },
  active: {
    backgroundColor: theme.palette.grey[300],
  },
}));

export default function ViewDrawer({drawerOpen}: {drawerOpen: boolean}) {
  // Render the view selection drawer
  const classes = useStyles();
  const {getNetworkName} = useNetworkListContext();
  const networkName = getNetworkName();

  const makePath = React.useCallback(
    (path: string) => {
      if (networkName) {
        return generatePath(path, {
          networkName,
        });
      } else {
        return CONFIG_PATH;
      }
    },
    [networkName],
  );

  return (
    <Drawer
      variant="permanent"
      classes={{
        paper: classNames(
          classes.drawerPaper,
          !drawerOpen && classes.drawerPaperClose,
        ),
      }}
      open={drawerOpen}>
      <div className={classes.toolbar} />
      <List>
        {VIEWS.filter(view => !view.hideCondition || !view.hideCondition()).map(
          ({name, path, icon}) => {
            return (
              <Tooltip
                key={name}
                title={name}
                placement="right"
                disableHoverListener={drawerOpen}
                disableFocusListener={true}
                disableTouchListener={true}>
                <ListItem
                  classes={{root: classes.drawerListItem}}
                  to={makePath(path)}
                  component={MUINavLink}
                  activeClassName={classes.active}
                  disabled={
                    networkName === null && !NETWORKLESS_VIEW_NAME !== name
                  }
                  button>
                  <ListItemIcon>{icon}</ListItemIcon>
                  <ListItemText primary={name} />
                </ListItem>
              </Tooltip>
            );
          },
        )}
        <Divider />
        <InfoMenu drawerOpen={drawerOpen} />
      </List>
    </Drawer>
  );
}
