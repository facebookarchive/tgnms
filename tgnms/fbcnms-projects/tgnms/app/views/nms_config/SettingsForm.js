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
import * as settingsApi from '@fbcnms/tg-nms/app/apiutils/SettingsAPIUtil';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import MaterialModal from '@fbcnms/tg-nms/app/components/common/MaterialModal';
import RestartWatcherModal, {useRestartWatcher} from './RestartWatcher';
import Typography from '@material-ui/core/Typography';
import lightGreen from '@material-ui/core/colors/lightGreen';
import red from '@material-ui/core/colors/red';
import useForm from '@fbcnms/tg-nms/app/hooks/useForm';
import {DATATYPE} from '@fbcnms/tg-nms/shared/dto/Settings';
import {EMPTY_SETTINGS_STATE} from '@fbcnms/tg-nms/shared/dto/Settings';
import {Provider as SettingsFormContextProvider} from './SettingsFormContext';
import {makeStyles} from '@material-ui/styles';
import {useConfirmationModalState} from '@fbcnms/tg-nms/app/hooks/modalHooks';
import {useSecretToggle} from './useSecretToggle';
import type {CancelTokenSource} from 'axios';
import type {EnvMap, SettingsState} from '@fbcnms/tg-nms/shared/dto/Settings';
import type {InputData} from './SettingsFormContext';

const useStyles = makeStyles(theme => ({
  oldValue: {
    backgroundColor: red[100],
    color: red[400],
    opacity: '0.7',
    whiteSpace: 'nowrap',
  },
  newValue: {
    textDecoration: 'none',
    backgroundColor: lightGreen[300],
    color: lightGreen[900],
    whiteSpace: 'nowrap',
  },
  restartWarning: {
    color: theme.palette.warning.dark,
  },
}));

type settingsFormHeadingType = {
  title?: string,
  description?: string,
  resetForm: () => void,
  changedSettings: Array<string>,
};

export default function SettingsForm({
  children,
  onUpdate,
  title,
  description,
  Heading,
}: {
  children: React.Node,
  onUpdate?: EnvMap => void,
  title?: string,
  description?: string,
  Heading?: React.ComponentType<settingsFormHeadingType>,
}) {
  const {
    getInput,
    formState,
    initialFormState,
    settingsState,
    resetForm,
    refreshSettings,
  } = useSettingsForm();

  const onUpdateRef = React.useRef(onUpdate);
  const hasHeading = !!Heading;

  React.useEffect(() => {
    if (onUpdateRef.current) {
      onUpdateRef.current(formState);
    }
  }, [formState, onUpdateRef]);

  const classes = useStyles();
  const originalSettings = initialFormState ?? {};
  const makeRequest = React.useCallback(async () => {
    await settingsApi.postSettings(formState);
  }, [formState]);
  const {
    isOpen,
    cancel,
    confirm,
    requestConfirmation,
  } = useConfirmationModalState();
  const changedSettings = React.useMemo<Array<string>>(() => {
    const changes = [];
    if (!originalSettings) {
      return changes;
    }
    for (const key in formState) {
      if (originalSettings[key] !== formState[key]) {
        changes.push(key);
      }
    }
    return changes;
  }, [formState, originalSettings]);

  const restartWatcher = useRestartWatcher();
  // changed settings which require a restart
  const settingsRequiringRestart = React.useMemo<Array<string>>(() => {
    const keys = [];
    if (!settingsState) {
      return keys;
    }
    for (const key of changedSettings) {
      const setting = settingsState.registeredSettings[key];
      if (setting.requiresRestart) {
        keys.push(key);
      }
    }
    return keys;
  }, [settingsState, changedSettings]);

  const handleSubmit = React.useCallback(
    (event: SyntheticEvent<HTMLFormElement>) => {
      event.preventDefault();
      requestConfirmation(async () => {
        try {
          await makeRequest();
          await refreshSettings();
        } catch (err) {
          /**
           * request can fail if NMS doesn't write the response before
           * the restart occurs but still log it just in case.
           */
          console.error(err);
        }
        if (settingsRequiringRestart.length > 0) {
          restartWatcher.start();
        }
      });
    },
    [
      requestConfirmation,
      makeRequest,
      refreshSettings,
      restartWatcher,
      settingsRequiringRestart,
    ],
  );

  return (
    <>
      <Grid item>
        <form onSubmit={handleSubmit}>
          <Grid container direction={'column'} spacing={4}>
            {Heading != undefined && (
              <Heading
                title={title}
                description={description}
                resetForm={resetForm}
                changedSettings={changedSettings}
              />
            )}
            <SettingsFormContextProvider
              getInput={getInput}
              formState={formState}
              settingsState={settingsState || EMPTY_SETTINGS_STATE}>
              <Grid
                container
                item
                spacing={3}
                direction={'column'}
                xs={hasHeading ? 10 : 12}>
                {children}
              </Grid>
            </SettingsFormContextProvider>
          </Grid>
        </form>
      </Grid>
      <RestartWatcherModal watcher={restartWatcher} />
      <MaterialModal
        open={isOpen}
        modalTitle="Confirm Settings Change"
        modalContent={
          <Grid container direction="column">
            {settingsRequiringRestart.length > 0 && (
              <Grid item xs={12}>
                <Typography className={classes.restartWarning}>
                  Warning: The following settings require an NMS restart
                </Typography>
                <ul>
                  {settingsRequiringRestart.map(s => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </Grid>
            )}
            <Grid item xs={12}>
              <Typography>
                Please review your settings changes. Submitting these changes
                may cause service disruption.
              </Typography>
            </Grid>
            <Grid item>
              {settingsState && (
                <ul>
                  {changedSettings.map(key => (
                    <li key={key}>
                      <ReviewSettingChanges
                        setting={key}
                        settingsState={settingsState}
                        formState={formState}
                        initialFormState={originalSettings}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </Grid>
          </Grid>
        }
        onClose={cancel}
        modalActions={
          <>
            <Button onClick={cancel} data-testid="cancel-settings-change">
              CANCEL
            </Button>
            <Button onClick={confirm} data-testid="confirm-settings-change">
              CONFIRM
            </Button>
          </>
        }
      />
    </>
  );
}

function ReviewSettingChanges({
  setting,
  settingsState,
  formState,
  initialFormState,
}: {
  setting: string,
  settingsState: SettingsState,
  formState: EnvMap,
  initialFormState: EnvMap,
}) {
  const classes = useStyles();
  const settingConfig = settingsState.registeredSettings[setting];
  const {isHidden, isSecret, isSecretVisible, toggleSecret} = useSecretToggle(
    settingConfig?.dataType || DATATYPE.STRING,
  );

  const oldVal = initialFormState[setting];
  const newVal = formState[setting];
  const mask = (x: ?string) =>
    typeof x === 'string' ? '*'.repeat(x.length) : '';
  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item>
        <Typography variant="body2">{setting}</Typography>
      </Grid>
      <Grid item>
        {isSecret && (
          <Button
            aria-label="toggle secret visibility"
            onClick={toggleSecret}
            size="small">
            {isSecretVisible ? 'Hide' : 'Show'}
          </Button>
        )}
      </Grid>
      <Grid item container direction="column" spacing={0}>
        <Grid item>
          <Typography>
            <del className={classes.oldValue}>
              {isHidden ? mask(oldVal) : oldVal}
            </del>
          </Typography>
        </Grid>
        <Grid item>
          <Typography>
            <ins className={classes.newValue}>
              {isHidden ? mask(newVal) : newVal}
            </ins>
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  );
}

/**
 * Populate the form with values from the backend and let the form take over.
 */
export function useSettingsForm() {
  const [refreshToken, setRefreshToken] = React.useState(
    new Date().toLocaleTimeString(),
  );
  const settingsState = useLoadSettingsState({refreshToken});
  const initialFormStateRef = React.useRef({});
  const {formState, setFormState, updateFormState} = useForm<EnvMap>({
    initialState: initialFormStateRef.current,
  });
  const resetForm = React.useCallback(
    () => setFormState(initialFormStateRef.current),
    [initialFormStateRef, setFormState],
  );
  React.useEffect(() => {
    if (settingsState) {
      const state = {
        ...settingsState.current,
        ...settingsState.envMaps.settingsFileEnv,
      };
      setFormState(state);
      initialFormStateRef.current = state;
    }
  }, [settingsState, setFormState, initialFormStateRef]);
  const refreshSettings = React.useCallback(
    () => setRefreshToken(new Date().toLocaleTimeString()),
    [setRefreshToken],
  );
  const getInput = React.useCallback(
    (key: string) => {
      const isOverridden =
        typeof settingsState?.envMaps.initialEnv[key] === 'string';

      const {dotenvEnv, initialEnv, defaults} = settingsState?.envMaps || {};
      let fallbackValue;
      for (const env of [dotenvEnv, initialEnv, defaults]) {
        if (!env) {
          continue;
        }
        const _val = env[key];
        if (_val != null) {
          fallbackValue = _val;
        }
      }

      return ({
        isOverridden,
        config: settingsState?.registeredSettings[key],
        value: formState[key],
        fallbackValue,
        onChange: (value: ?string) => {
          updateFormState({[key]: value});
        },
      }: $Shape<InputData>);
    },
    [settingsState, formState, updateFormState],
  );

  return {
    settingsState,
    getInput,
    formState,
    refreshSettings,
    resetForm,
    initialFormState: initialFormStateRef.current,
  };
}

/**
 * Load settings state from the backend
 */
function useLoadSettingsState(
  options: ?{
    refreshToken: string,
  },
): ?SettingsState {
  const {refreshToken} = options || {refreshToken: ''};
  const [settingsState, setSettingsState] = React.useState<?SettingsState>(
    null,
  );
  React.useEffect(() => {
    let cancelSource: CancelTokenSource;
    async function makeRequest() {
      const settings = await settingsApi.getSettings();
      setSettingsState(settings);
    }
    makeRequest();
    return () => cancelSource && cancelSource.cancel();
  }, [refreshToken]);
  return settingsState;
}
