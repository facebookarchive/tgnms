/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict-local
 */

import 'jest-dom/extend-expect';
import * as React from 'react';
import * as networkTestAPIUtil from '../../../apiutils/NetworkTestAPIUtil';
import EditNetworkTestScheduleModal from '../EditNetworkTestScheduleModal';
import {
  ScheduleNetworkTestModalWrapper,
  TestApp,
} from '../../../tests/testHelpers';
import {cleanup, fireEvent, render} from '@testing-library/react';

const editTestScheduleMock = jest
  .spyOn(networkTestAPIUtil, 'editTestSchedule')
  .mockImplementation(() => Promise.resolve());

jest.mock('@fbcnms/ui/hooks/useSnackbar');

const enqueueSnackbarMock = jest.fn();
jest
  .spyOn(require('@fbcnms/ui/hooks/useSnackbar'), 'useEnqueueSnackbar')
  .mockReturnValue(enqueueSnackbarMock);

afterEach(() => {
  cleanup();
});

const defaultProps = {
  onActionClick: jest.fn(),
  id: 1,
  type: 'sequential',
  initialOptions: {},
  initialCronString: '',
};

test('renders without crashing', () => {
  const {getByText} = render(
    <TestApp>
      <ScheduleNetworkTestModalWrapper>
        <EditNetworkTestScheduleModal {...defaultProps} />
      </ScheduleNetworkTestModalWrapper>
    </TestApp>,
  );
  expect(getByText('Edit')).toBeInTheDocument();
});

test('button click opens modal', () => {
  const {getByText} = render(
    <TestApp>
      <ScheduleNetworkTestModalWrapper>
        <EditNetworkTestScheduleModal {...defaultProps} />
      </ScheduleNetworkTestModalWrapper>
    </TestApp>,
  );
  expect(getByText('Edit')).toBeInTheDocument();
  fireEvent.click(getByText('Edit'));
  expect(getByText('Edit Network Test Schedule')).toBeInTheDocument();
});

test('Edit schedule calls edit api', () => {
  const {getByText} = render(
    <TestApp>
      <ScheduleNetworkTestModalWrapper>
        <EditNetworkTestScheduleModal {...defaultProps} />
      </ScheduleNetworkTestModalWrapper>
    </TestApp>,
  );
  expect(getByText('Edit')).toBeInTheDocument();
  fireEvent.click(getByText('Edit'));
  expect(getByText('Edit Network Test Schedule')).toBeInTheDocument();
  fireEvent.click(getByText('Edit Schedule'));
  expect(editTestScheduleMock).toHaveBeenCalled();
});

test('no adhoc should be available', () => {
  const {getByText, queryByText} = render(
    <TestApp>
      <ScheduleNetworkTestModalWrapper>
        <EditNetworkTestScheduleModal {...defaultProps} />
      </ScheduleNetworkTestModalWrapper>
    </TestApp>,
  );
  expect(getByText('Edit')).toBeInTheDocument();
  fireEvent.click(getByText('Edit'));
  expect(getByText('Edit Network Test Schedule')).toBeInTheDocument();
  expect(queryByText('now')).not.toBeInTheDocument();
});
