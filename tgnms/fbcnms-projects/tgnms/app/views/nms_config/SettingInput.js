/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

import * as React from 'react';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import Link from '@material-ui/core/Link';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import {DATATYPE, Validators} from '@fbcnms/tg-nms/shared/dto/Settings';
import {DATA_TYPE_TO_INPUT_TYPE} from '@fbcnms/tg-nms/app/constants/ConfigConstants';
import {FEATURE_FLAGS} from '@fbcnms/tg-nms/shared/FeatureFlags';
import {makeStyles} from '@material-ui/styles';
import {useSecretToggle} from './useSecretToggle';
import {useSettingsFormContext} from './SettingsFormContext';
import type {SettingDefinition} from '@fbcnms/tg-nms/shared/dto/Settings';

const useStyles = makeStyles(theme => ({
  configKey: {
    color: theme.palette.text.secondary,
    transform: `translate(0, -20px) scale(0.75)`,
    position: 'absolute',
    top: 0,
    right: 0,
  },
  overrideText: {
    color: theme.palette.warning.dark,
  },
}));
export type Props = {|
  setting: string,
  label: string,
  helperText?: React.Node,
  isFeatureToggle?: boolean,
|};
export default function SettingInput({
  setting,
  label,
  helperText,
  isFeatureToggle,
}: Props) {
  const classes = useStyles();
  const settingsForm = useSettingsFormContext();
  const {config, value, fallbackValue, onChange} = settingsForm.getInput(
    setting,
  );
  const handleDeleteSetting = React.useCallback(() => {
    onChange(null);
  }, [onChange]);
  const [errorText, setErrorText] = React.useState<?string>();
  const validate = React.useCallback(
    (val: ?string) => {
      let validators: Array<(v: ?string) => boolean> = [];
      if (config?.validations) {
        validators = validators.concat(
          (config?.validations ?? []).map(key => Validators[key]),
        );
      }
      if (validators.length < 1) {
        return true;
      }
      try {
        if (val == null || val.trim() == '') {
          return true;
        }
        for (const validator of validators) {
          const result = validator(val);
          if (result !== true) {
            setErrorText('Invalid setting');
            return false;
          }
        }
      } catch (err) {
        setErrorText(err?.message ?? 'Invalid setting');
        return false;
      }
      setErrorText(null);
      return true;
    },
    [config, setErrorText],
  );
  const hasError = React.useMemo<boolean>(() => !validate(value), [
    validate,
    value,
  ]);

  const {isHidden, isSecret, isSecretVisible, toggleSecret} = useSecretToggle(
    config?.dataType || DATATYPE.STRING,
  );

  const settingType = config
    ? DATA_TYPE_TO_INPUT_TYPE[config.dataType]
    : 'text';

  const isDefaultEnabled =
    isFeatureToggle == true &&
    (FEATURE_FLAGS[setting]?.isDefaultEnabled ?? false);
  return (
    <Grid item>
      {config && settingType === 'checkbox' && (
        <>
          <FormControlLabel
            control={React.createElement(
              isFeatureToggle === true ? Switch : Checkbox,
              {
                checked:
                  typeof value !== 'undefined' && value !== ''
                    ? value === 'true'
                    : isDefaultEnabled,
                onChange: e => {
                  onChange(e.target.checked ? 'true' : 'false');
                },
                value: value || '',
                color: 'primary',
              },
            )}
            label={label}
          />
          {helperText != null && helperText}
        </>
      )}
      {config && settingType !== 'checkbox' && (
        <TextField
          id={config?.key}
          name={config?.key}
          error={hasError}
          helperText={
            <>
              {helperText != null && helperText}
              <ResetToValueButton
                config={config}
                onResetClick={handleDeleteSetting}
              />
              {errorText != null && errorText != '' && (
                <Typography>{errorText}</Typography>
              )}
            </>
          }
          label={label}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          fullWidth
          type={isHidden ? 'password' : 'text'}
          placeholder={!isHidden ? fallbackValue ?? '' : '******'}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <span className={classes.configKey}>{config?.key}</span>
                {isSecret && (
                  <Button
                    aria-label="toggle secret visibility"
                    onClick={toggleSecret}
                    size="small">
                    {isSecretVisible ? 'Hide' : 'Show'}
                  </Button>
                )}
              </InputAdornment>
            ),
          }}
        />
      )}
    </Grid>
  );
}

/**
 * Removes an override from the settings.json file and falls back to the .env or
 * hard-coded defaults.
 */
function ResetToValueButton({
  config,
  onResetClick,
}: {
  config: SettingDefinition,
  onResetClick: () => void,
}) {
  const {isSecret} = useSecretToggle(config.dataType);
  const {settingsState, getInput} = useSettingsFormContext();
  const {settingsFileEnv} = settingsState.envMaps;
  const {fallbackValue} = getInput(config.key);

  // Don't show reset if setting has not been edited and saved.
  if (settingsFileEnv[config.key] == null) {
    return null;
  }

  const fallbackValueText = isSecret
    ? '******'
    : fallbackValue == null || fallbackValue.trim() === ''
    ? 'empty'
    : fallbackValue;

  return (
    <span>
      <Link href="#" onClick={onResetClick}>
        Reset
      </Link>{' '}
      to {fallbackValueText}
    </span>
  );
}
