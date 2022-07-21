/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

import * as serviceApiUtil from '@fbcnms/tg-nms/app/apiutils/ServiceAPIUtil';
import ModalAbort from '../ModalAbort';
import React from 'react';
import {TestApp} from '@fbcnms/tg-nms/app/tests/testHelpers';
import {act, fireEvent, render, waitFor} from '@testing-library/react';
import {assertType} from '@fbcnms/util/assert';
import {mockUpgradeReqData} from '@fbcnms/tg-nms/app/tests/data/Upgrade';

const apiServiceRequestMock = jest
  .spyOn(serviceApiUtil, 'apiServiceRequest')
  .mockImplementation(() => Promise.resolve());

const defaultProps = {
  networkName: 'testNetwork',
  upgradeRequests: [],
};

test('renders without crashing', () => {
  const {getByText} = render(
    <TestApp>
      <ModalAbort {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Abort Upgrade')).toBeInTheDocument();
});

test('opens without crashing', async () => {
  const {getByText} = render(
    <TestApp>
      <ModalAbort {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Abort Upgrade')).toBeInTheDocument();
  fireEvent.click(getByText('Abort Upgrade'));
  await waitFor(() => getByText('Abort Upgrade Requests'));
  expect(getByText('Abort Upgrade Requests')).toBeInTheDocument();
});

test('closes', async () => {
  const {getByText, queryByText} = render(
    <TestApp>
      <ModalAbort {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Abort Upgrade')).toBeInTheDocument();
  fireEvent.click(getByText('Abort Upgrade'));
  await waitFor(() => getByText('Abort Upgrade Requests'));
  fireEvent.click(getByText('Close'));
  await waitFor(() => {
    expect(queryByText('Abort Upgrade Requests')).not.toBeInTheDocument();
  });
  expect(getByText('Abort Upgrade')).toBeInTheDocument();
});

test('abort button disabled if no image is defined', async () => {
  const {getByText} = render(
    <TestApp>
      <ModalAbort {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Abort Upgrade')).toBeInTheDocument();
  fireEvent.click(getByText('Abort Upgrade'));
  await waitFor(() => getByText('Abort Upgrade Requests'));
  fireEvent.click(getByText('Abort'));
  expect(apiServiceRequestMock).not.toHaveBeenCalled();
});

test('abort disabled if no image is selected', async () => {
  const {getByText} = render(
    <TestApp>
      <ModalAbort {...defaultProps} upgradeRequests={[mockUpgradeReqData()]} />
    </TestApp>,
  );
  expect(getByText('Abort Upgrade')).toBeInTheDocument();
  fireEvent.click(getByText('Abort Upgrade'));
  await waitFor(() => getByText('Abort Upgrade Requests'));
  fireEvent.click(getByText('Abort'));
  expect(apiServiceRequestMock).not.toHaveBeenCalled();
});

test('abort success', async () => {
  const {getByText, getByTestId} = render(
    <TestApp>
      <ModalAbort {...defaultProps} upgradeRequests={[mockUpgradeReqData()]} />
    </TestApp>,
  );
  expect(getByText('Abort Upgrade')).toBeInTheDocument();
  fireEvent.click(getByText('Abort Upgrade'));
  await waitFor(() => getByText('Abort Upgrade Requests'));
  fireEvent.click(
    assertType(
      getByTestId('selectAllBox').childNodes[0].childNodes[0],
      HTMLElement,
    ),
  );
  await act(async _ => {
    fireEvent.click(getByText('Abort'));
  });
  expect(apiServiceRequestMock).toHaveBeenCalledTimes(1);
  expect(apiServiceRequestMock).toHaveBeenLastCalledWith(
    'testNetwork',
    'abortUpgrade',
    {abortAll: true, resetStatus: true, reqIds: []},
  );
  expect(getByText('Abort Upgrade(s) Success')).toBeInTheDocument();
});

test('abort fail', async () => {
  apiServiceRequestMock.mockImplementation(() => Promise.reject('error'));

  const {getByText, getByTestId} = render(
    <TestApp>
      <ModalAbort {...defaultProps} upgradeRequests={[mockUpgradeReqData()]} />
    </TestApp>,
  );
  expect(getByText('Abort Upgrade')).toBeInTheDocument();
  fireEvent.click(getByText('Abort Upgrade'));
  await waitFor(() => getByText('Abort Upgrade Requests'));
  fireEvent.click(
    assertType(
      getByTestId('selectAllBox').childNodes[0].childNodes[0],
      HTMLElement,
    ),
  );
  fireEvent.click(getByText('Abort'));
  expect(apiServiceRequestMock).toHaveBeenCalledTimes(1);
  await waitFor(() => getByText('Abort Upgrade Failed'));
  expect(getByText('Abort Upgrade Failed')).toBeInTheDocument();
});
