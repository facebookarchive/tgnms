/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import * as React from 'react';
import FormLabel from '@material-ui/core/FormLabel';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import TroubleshootWarning from './TroubleshootWarning';
import useForm from '@fbcnms/tg-nms/app/hooks/useForm';
import useTroubleshootAutomation from '@fbcnms/tg-nms/app/hooks/useTroubleshootAutomation';
import {SWARM_URLS} from '@fbcnms/tg-nms/app/constants/ConfigConstants';
import {makeStyles} from '@material-ui/styles';

const useStyles = makeStyles(() => ({
  label: {
    color: 'black',
  },
}));

export default function PrometheusOffline() {
  const attemptTroubleShootAutomation = useTroubleshootAutomation();
  const classes = useStyles();
  const {handleInputChange, formState} = useForm({
    initialState: {
      prometheus: SWARM_URLS.PROMETHEUS_URL,
    },
  });

  const onAttemptFix = React.useCallback(() => {
    const successMessage = 'Successfully changed prometheus URL.';
    const settingsChange = {PROMETHEUS: formState.prometheus};

    attemptTroubleShootAutomation({settingsChange, successMessage});
  }, [attemptTroubleShootAutomation, formState]);

  return (
    <TroubleshootWarning
      isToolTip={true}
      title="Prometheus Offline"
      modalContent={
        <Grid container spacing={3}>
          <Grid item container>
            <Grid item>
              This is usually caused by incorrect prometheus URL in settings.
            </Grid>
            <Grid item>
              Please enter the correct URL and click submit to change setting.
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <FormLabel className={classes.label}>Prometheus URL</FormLabel>
            <TextField
              fullWidth
              value={formState.prometheus}
              onChange={handleInputChange(val => ({prometheus: val}))}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid>
        </Grid>
      }
      onAttemptFix={onAttemptFix}
    />
  );
}
