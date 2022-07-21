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
import SettingInput from '../SettingInput';
import {EMPTY_SETTINGS_STATE} from '@fbcnms/tg-nms/shared/dto/Settings';
import {
  SettingsFormContextWrapper,
  TestApp,
  coerceClass,
} from '@fbcnms/tg-nms/app/tests/testHelpers';

import type {Props as SettingInputProps} from '../SettingInput';

import {act, fireEvent, render} from '@testing-library/react';

const defaultProps: $Shape<SettingInputProps> = {
  label: '',
};

describe('data type', () => {
  test('renders a text input if the data type is STRING', () => {
    const {getByLabelText} = render(
      <TestApp>
        <SettingsFormContextWrapper
          settings={[
            {
              dataType: 'STRING',
              key: 'SETTING_KEY',
            },
          ]}>
          <SettingInput
            {...defaultProps}
            label={'SETTING_KEY'}
            setting={'SETTING_KEY'}
          />
        </SettingsFormContextWrapper>
      </TestApp>,
    );
    const input = coerceClass(getByLabelText('SETTING_KEY'), HTMLInputElement);
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('text');
  });
  test('renders a checkbox input if the data type is BOOL', () => {
    const {getByLabelText} = render(
      <TestApp>
        <SettingsFormContextWrapper
          settings={[
            {
              dataType: 'BOOL',
              key: 'SETTING_KEY',
            },
          ]}>
          <SettingInput
            {...defaultProps}
            label={'SETTING_KEY'}
            setting={'SETTING_KEY'}
          />
        </SettingsFormContextWrapper>
      </TestApp>,
    );
    const input = coerceClass(getByLabelText('SETTING_KEY'), HTMLInputElement);
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('checkbox');
  });
  test('renders a password input if the data type is SECRET_STRING', () => {
    const {getByLabelText} = render(
      <TestApp>
        <SettingsFormContextWrapper
          settings={[
            {
              dataType: 'SECRET_STRING',
              key: 'SETTING_KEY',
            },
          ]}>
          <SettingInput
            {...defaultProps}
            label={'SETTING_KEY'}
            setting={'SETTING_KEY'}
          />
        </SettingsFormContextWrapper>
      </TestApp>,
    );
    const input = coerceClass(getByLabelText('SETTING_KEY'), HTMLInputElement);
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('password');
  });
});

describe('secrets', () => {
  test('renders secret visibility toggle and reset for SECRET_STRING', () => {
    const {getByText, queryByLabelText} = render(
      <TestApp>
        <SettingsFormContextWrapper
          settings={[
            {
              dataType: 'SECRET_STRING',
              key: 'SETTING_KEY',
            },
          ]}
          settingsState={{
            ...EMPTY_SETTINGS_STATE,
            envMaps: {
              defaults: {},
              initialEnv: {},
              dotenvEnv: {},
              settingsFileEnv: {SETTING_KEY: 'my secret'},
            },
          }}>
          <SettingInput {...defaultProps} setting={'SETTING_KEY'} />
        </SettingsFormContextWrapper>
      </TestApp>,
    );
    expect(queryByLabelText('toggle secret visibility')).toBeInTheDocument();
    expect(getByText('to ******')).toBeInTheDocument(); // Reset to ******
  });
  test('does not renders secret visibility toggle for non SECRET_STRING', () => {
    const {queryByLabelText} = render(
      <TestApp>
        <SettingsFormContextWrapper
          settings={[
            {dataType: 'STRING', key: 'SETTING_KEY'},
            {dataType: 'INT', key: 'SETTING_KEY_2'},
            {dataType: 'BOOL', key: 'SETTING_KEY_2'},
            {
              dataType: 'STRING_ARRAY',
              key: 'SETTING_KEY_2',
            },
          ]}>
          <SettingInput {...defaultProps} setting={'SETTING_KEY'} />
          <SettingInput {...defaultProps} setting={'SETTING_KEY_2'} />
          <SettingInput {...defaultProps} setting={'SETTING_KEY_2'} />
          <SettingInput {...defaultProps} setting={'SETTING_KEY_2'} />
        </SettingsFormContextWrapper>
      </TestApp>,
    );
    expect(
      queryByLabelText('toggle secret visibility'),
    ).not.toBeInTheDocument();
  });
  test('clicking toggle shows/hides secret', () => {
    const {getByLabelText} = render(
      <TestApp>
        <SettingsFormContextWrapper
          settings={[
            {
              dataType: 'SECRET_STRING',
              key: 'SETTING_KEY',
            },
          ]}>
          <SettingInput
            {...defaultProps}
            label={'SETTING_KEY'}
            setting={'SETTING_KEY'}
          />
        </SettingsFormContextWrapper>
      </TestApp>,
    );

    const getInput = () =>
      coerceClass(getByLabelText('SETTING_KEY'), HTMLInputElement);
    const toggle = getByLabelText('toggle secret visibility');
    expect(getInput().type).toBe('password');
    act(() => {
      fireEvent.click(toggle);
    });
    expect(getInput().type).toBe('text');
    act(() => {
      fireEvent.click(toggle);
    });
    expect(getInput().type).toBe('password');
  });
});

describe('feature flags', () => {
  test('shows FEATURE_FLAGS isDefaultEnabled value if nothing is set', () => {
    const {getByLabelText} = render(
      <TestApp>
        <SettingsFormContextWrapper
          settings={[
            // these are defined in FEATURE_FLAGS
            {
              dataType: 'BOOL',
              key: 'ALERTS_LAYER_ENABLED', // feature disabled by default
            },
            {
              dataType: 'BOOL',
              key: 'JSON_CONFIG_ENABLED', // feature enabled by default
            },
          ]}>
          <SettingInput
            {...defaultProps}
            label={'ALERTS_LAYER_ENABLED'}
            setting={'ALERTS_LAYER_ENABLED'}
            isFeatureToggle
          />
          <SettingInput
            {...defaultProps}
            label={'JSON_CONFIG_ENABLED'}
            setting={'JSON_CONFIG_ENABLED'}
            isFeatureToggle
          />
        </SettingsFormContextWrapper>
      </TestApp>,
    );

    const alertsInput = coerceClass(
      getByLabelText('ALERTS_LAYER_ENABLED'),
      HTMLInputElement,
    );
    const jsonInput = coerceClass(
      getByLabelText('JSON_CONFIG_ENABLED'),
      HTMLInputElement,
    );
    expect(alertsInput.checked).toBe(false);
    expect(jsonInput.checked).toBe(true);
  });
});
