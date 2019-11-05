/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {AlertRoutingTree} from '../AlarmAPIType';

import AlertActionDialog from '../AlertActionDialog';
import CircularProgress from '@material-ui/core/CircularProgress';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import React from 'react';
import SimpleTable from '../SimpleTable';

import {makeStyles} from '@material-ui/styles';
import {useAxios, useRouter} from '@fbcnms/ui/hooks';
import {useEnqueueSnackbar} from '@fbcnms/ui/hooks/useSnackbar';
import {useState} from 'react';
import type {ApiUrls} from '../ApiUrls';

const useStyles = makeStyles({
  loading: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

type Props = {
  apiUrls: ApiUrls,
};

export default function Routes(props: Props) {
  const [menuAnchorEl, setMenuAnchorEl] = useState<?HTMLElement>(null);
  const [currentAlert, setCurrentAlert] = useState<Object>({});
  const [showAlertActionDialog, setShowAlertActionDialog] = useState<?'view'>(
    null,
  );
  const [lastRefreshTime, _setLastRefreshTime] = useState<string>(
    new Date().toLocaleString(),
  );
  const classes = useStyles();
  const {match} = useRouter();
  const enqueueSnackbar = useEnqueueSnackbar();

  const onDialogAction = args => {
    setShowAlertActionDialog(args);
    setMenuAnchorEl(null);
  };

  const {isLoading, error, response} = useAxios<null, Array<AlertRoutingTree>>({
    method: 'get',
    url: props.apiUrls.viewRoutes(match),
    cacheCounter: lastRefreshTime,
  });

  if (error) {
    enqueueSnackbar(
      `Unable to load receivers: ${
        error.response ? error.response.data.message : error.message
      }`,
      {variant: 'error'},
    );
  }

  const routesList = response?.data || [];

  return (
    <>
      <SimpleTable
        tableData={routesList}
        onActionsClick={(alert, target) => {
          setMenuAnchorEl(target);
          setCurrentAlert(alert);
        }}
        columnStruct={[
          {title: 'name', path: ['receiver']},
          {title: 'group by', path: ['group_by']},
          {title: 'match', path: ['match']},
        ]}
      />
      {isLoading && routesList.length === 0 && (
        <div className={classes.loading}>
          <CircularProgress />
        </div>
      )}
      <Menu
        anchorEl={menuAnchorEl}
        keepMounted
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}>
        <MenuItem onClick={() => onDialogAction('view')}>View</MenuItem>
      </Menu>
      <AlertActionDialog
        open={showAlertActionDialog != null}
        onClose={() => onDialogAction(null)}
        title={'View Alert'}
        alertConfig={currentAlert || {}}
        showCopyButton={true}
        showDeleteButton={false}
      />
    </>
  );
}
