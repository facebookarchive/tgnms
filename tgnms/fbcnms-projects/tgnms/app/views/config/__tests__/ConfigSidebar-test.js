/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict-local
 */

import 'jest-dom/extend-expect';
import ConfigSidebar from '../ConfigSidebar';
import MaterialTheme from '../../../MaterialTheme';
import React from 'react';
import {CONFIG_MODES} from '../../../constants/ConfigConstants';
import {cleanup, fireEvent, render} from '@testing-library/react';
import {initWindowConfig} from '../../../tests/testHelpers';
import {mockConfigTaskContextValue} from '../../../tests/data/NetworkConfig';
import {mockNetworkContext} from '../../../tests/data/NetworkContext';

beforeEach(() => {
  initWindowConfig({
    featureFlags: {
      JSON_CONFIG_ENABLED: true,
      FORM_CONFIG_ENABLED: true,
      TABLE_CONFIG_ENABLED: true,
    },
  });
});

jest.mock('react-router', () => ({
  useHistory: () => ({
    replace: jest.fn(),
  }),
}));

const mockUseConfigTaskContext = jest
  .spyOn(require('../../../contexts/ConfigTaskContext'), 'useConfigTaskContext')
  .mockImplementation(jest.fn(() => mockConfigTaskContextValue()));

jest
  .spyOn(require('../../../contexts/NetworkContext'), 'useNetworkContext')
  .mockImplementation(jest.fn(() => mockNetworkContext()));

jest
  .spyOn(require('../../../apiutils/ConfigAPIUtil'), 'getNodeOverridesConfig')
  .mockReturnValue({});

jest
  .spyOn(require('../../../hooks/useSnackbar'), 'useAlertIfPendingChanges')
  .mockImplementation(jest.fn(() => () => false));

const snackbarsMock = {
  error: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
};
jest
  .spyOn(require('../../../hooks/useSnackbar'), 'useSnackbars')
  .mockReturnValue(snackbarsMock);

jest
  .spyOn(require('../../../helpers/ConfigHelpers'), 'getTopologyNodeList')
  .mockReturnValue([{name: 'testNode'}, {name: 'mock filter node'}]);

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

const defaultProps = {
  useRawJsonEditor: false,
  hideDeprecatedFields: true,
  onChangeContentDisplayType: jest.fn(() => {}),
  onSelectNode: jest.fn(() => {}),
  onSelectImage: jest.fn(() => {}),
  onSelectHardwareType: jest.fn(() => {}),
  onSelectFirmwareVersion: jest.fn(() => {}),
  onSetHideDeprecated: jest.fn(() => {}),
};

test('renders network sidebar without crashing', () => {
  mockUseConfigTaskContext.mockReturnValue(mockConfigTaskContextValue());

  const {getByText} = render(
    <MaterialTheme>
      <ConfigSidebar {...defaultProps} />
    </MaterialTheme>,
  );
  expect(getByText('Configuration Options')).toBeInTheDocument();
  expect(getByText('Change Base Version')).toBeInTheDocument();
});

test('renders e2e sidebar without crashing', () => {
  mockUseConfigTaskContext.mockReturnValue(mockConfigTaskContextValue());

  const {getByText} = render(
    <MaterialTheme>
      <ConfigSidebar {...defaultProps} />
    </MaterialTheme>,
  );
  expect(getByText('Configuration Options')).toBeInTheDocument();
});

test('renders node sidebar without crashing', () => {
  mockUseConfigTaskContext.mockReturnValue(
    mockConfigTaskContextValue({
      editMode: 'NODE',
    }),
  );
  const {getByText} = render(
    <MaterialTheme>
      <ConfigSidebar {...defaultProps} />
    </MaterialTheme>,
  );
  expect(getByText('Configuration Options')).toBeInTheDocument();
  expect(getByText('Filter')).toBeInTheDocument();
  expect(getByText('Show Full Configuration')).toBeInTheDocument();
});

test('change editor calls onChangeEditorType', () => {
  mockUseConfigTaskContext.mockReturnValue(
    mockConfigTaskContextValue({
      editMode: 'E2E',
    }),
  );

  const {getByText} = render(
    <MaterialTheme>
      <ConfigSidebar {...defaultProps} />
    </MaterialTheme>,
  );
  expect(getByText('Configuration Options')).toBeInTheDocument();
  fireEvent.mouseDown(getByText('Form'));
  fireEvent.click(getByText('JSON'));
  expect(defaultProps.onChangeContentDisplayType).toHaveBeenCalled();
});

test('renders network actions button', () => {
  mockUseConfigTaskContext.mockReturnValue(mockConfigTaskContextValue());

  const {getByText} = render(
    <MaterialTheme>
      <ConfigSidebar {...defaultProps} />
    </MaterialTheme>,
  );
  expect(getByText(/network optimization/i)).toBeInTheDocument();
});

test('renders network actions when button is clicked', () => {
  mockUseConfigTaskContext.mockReturnValue(mockConfigTaskContextValue());

  const {getByText} = render(
    <MaterialTheme>
      <ConfigSidebar {...defaultProps} />
    </MaterialTheme>,
  );
  expect(getByText(/network optimization/i)).toBeInTheDocument();
  fireEvent.click(getByText(/network optimization/i));
  expect(getByText('Actions')).toBeInTheDocument();
});

test('renders network baseConfigs', () => {
  mockUseConfigTaskContext.mockReturnValue(mockConfigTaskContextValue());

  const {getByText} = render(
    <MaterialTheme>
      <ConfigSidebar {...defaultProps} />
    </MaterialTheme>,
  );
  expect(getByText('Configuration Options')).toBeInTheDocument();
  expect(getByText('default')).toBeInTheDocument();
  fireEvent.mouseDown(getByText('default'));
  expect(getByText('test')).toBeInTheDocument();
});

test('renders node config change', async () => {
  mockUseConfigTaskContext.mockReturnValue(mockConfigTaskContextValue());

  const {getByText} = render(
    <MaterialTheme>
      <ConfigSidebar {...defaultProps} />
    </MaterialTheme>,
  );
  expect(getByText('Configuration Options')).toBeInTheDocument();
  expect(getByText('default')).toBeInTheDocument();
  fireEvent.mouseDown(getByText('default'));
  expect(getByText('test')).toBeInTheDocument();
  fireEvent.click(getByText('test'));
  expect(getByText('test')).toBeInTheDocument();
  expect(defaultProps.onSelectImage).toHaveBeenCalled();
});

test('renders node filter change', async () => {
  mockUseConfigTaskContext.mockReturnValue(
    mockConfigTaskContextValue({
      editMode: 'NODE',
    }),
  );
  const {getByText} = render(
    <MaterialTheme>
      <ConfigSidebar {...defaultProps} />
    </MaterialTheme>,
  );
  expect(getByText('Configuration Options')).toBeInTheDocument();
  expect(getByText(CONFIG_MODES.NODE)).toBeInTheDocument();
  fireEvent.mouseDown(getByText(CONFIG_MODES.NODE));
  expect(getByText(CONFIG_MODES.OVERRIDE)).toBeInTheDocument();
  expect(getByText(CONFIG_MODES.CN)).toBeInTheDocument();
  fireEvent.click(getByText(CONFIG_MODES.CN));
  expect(defaultProps.onSelectNode).toHaveBeenCalled();
});

test('change E2E base fields', () => {
  mockUseConfigTaskContext.mockReturnValue(mockConfigTaskContextValue());
  const {getByText} = render(
    <MaterialTheme>
      <ConfigSidebar {...defaultProps} />
    </MaterialTheme>,
  );
  expect(getByText('Configuration Options')).toBeInTheDocument();
  // First hidden is for the 'Base Fields' option
  fireEvent.mouseDown(getByText('Hidden'));
  // Second hidden is for the 'Hide Deprecated Fields' option
  expect(getByText('Show all')).toBeInTheDocument();
  fireEvent.click(getByText('Show all'));
  expect(defaultProps.onSetHideDeprecated).toHaveBeenCalled();
});

test('renders network firmware', () => {
  mockUseConfigTaskContext.mockReturnValue(mockConfigTaskContextValue());
  const {getByText} = render(
    <MaterialTheme>
      <ConfigSidebar {...defaultProps} />
    </MaterialTheme>,
  );
  expect(getByText('Configuration Options')).toBeInTheDocument();
  expect(getByText('Change Firmware Version')).toBeInTheDocument();
  expect(getByText('none')).toBeInTheDocument();
  fireEvent.mouseDown(getByText('none'));
  expect(getByText('test')).toBeInTheDocument();
});

test('renders node config change', async () => {
  mockUseConfigTaskContext.mockReturnValue(mockConfigTaskContextValue());
  const {getByText} = render(
    <MaterialTheme>
      <ConfigSidebar {...defaultProps} />
    </MaterialTheme>,
  );
  expect(getByText('Configuration Options')).toBeInTheDocument();
  expect(getByText('none')).toBeInTheDocument();
  fireEvent.mouseDown(getByText('none'));
  expect(getByText('test')).toBeInTheDocument();
  fireEvent.click(getByText('test'));
  expect(getByText('test')).toBeInTheDocument();
  expect(defaultProps.onSelectFirmwareVersion).toHaveBeenCalled();
});
