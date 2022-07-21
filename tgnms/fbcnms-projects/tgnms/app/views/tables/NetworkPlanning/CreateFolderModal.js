/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import * as networkPlanningAPIUtil from '@fbcnms/tg-nms/app/apiutils/NetworkPlanningAPIUtil';
import Alert from '@material-ui/lab/Alert';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Grid from '@material-ui/core/Grid';
import MaterialModal from '@fbcnms/tg-nms/app/components/common/MaterialModal';
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import useForm from '@fbcnms/tg-nms/app/hooks/useForm';
import useTaskState from '@fbcnms/tg-nms/app/hooks/useTaskState';
import {isNullOrEmptyString} from '@fbcnms/tg-nms/app/helpers/StringHelpers';
import type {PlanFolder} from '@fbcnms/tg-nms/shared/dto/NetworkPlan';

type Props = {|
  isOpen: boolean,
  onClose: () => void,
  onComplete: () => void,
|};
export default function CreateFolderModal({
  isOpen,
  onClose,
  onComplete,
}: Props) {
  const taskState = useTaskState();
  const {formState, handleInputChange} = useForm<PlanFolder>({
    initialState: {},
  });
  const handleSubmitClick = React.useCallback(async () => {
    try {
      taskState.reset();
      taskState.loading();
      if (!validate(formState)) {
        throw new Error('Project name is required');
      }
      await networkPlanningAPIUtil.createFolder(formState);
      taskState.success();
      onComplete();
      onClose();
    } catch (err) {
      taskState.setMessage(err.message);
      taskState.error();
    }
  }, [formState, taskState, onComplete, onClose]);
  return (
    <MaterialModal
      open={isOpen}
      onClose={onClose}
      modalTitle={'Add new project'}
      modalContent={
        <Grid container direction="column">
          {taskState.isSuccess && (
            <Alert color="success" severity="success">
              <Typography>Project created</Typography>
            </Alert>
          )}
          {taskState.isError && (
            <Alert color="error" severity="error">
              <Grid item container direction="column">
                <Grid item>
                  <Typography>Creating project failed</Typography>
                </Grid>
                {taskState.message && (
                  <Grid item>
                    <Typography>{taskState.message}</Typography>
                  </Grid>
                )}{' '}
              </Grid>
            </Alert>
          )}
          <Grid item xs={12}>
            <TextField
              id="name"
              onChange={handleInputChange(x => ({name: x}))}
              value={formState.name}
              placeholder="Project Name"
              disabled={taskState.isLoading}
              fullWidth
            />
          </Grid>
        </Grid>
      }
      modalActions={
        <>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button
            disabled={!validate(formState)}
            color="primary"
            onClick={handleSubmitClick}
            variant="contained">
            Submit{' '}
            {taskState.isLoading && (
              <CircularProgress size={10} style={{marginLeft: 5}} />
            )}
          </Button>
        </>
      }
    />
  );
}

function validate(folder: PlanFolder) {
  return !isNullOrEmptyString(folder.name);
}
