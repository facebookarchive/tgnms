/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

import ModalReset from '../ModalReset';
import React from 'react';
import {TestApp} from '@fbcnms/tg-nms/app/tests/testHelpers';
import {fireEvent, render, waitFor} from '@testing-library/react';

import * as serviceApiUtil from '@fbcnms/tg-nms/app/apiutils/ServiceAPIUtil';

const apiServiceRequestMock = jest
  .spyOn(serviceApiUtil, 'apiServiceRequest')
  .mockImplementation(() => Promise.resolve());

const defaultProps = {
  selected: ['testNode'],
  networkName: 'Tower C',
};

test('renders without crashing', () => {
  const {getByText} = render(
    <TestApp>
      <ModalReset {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Reset')).toBeInTheDocument();
});

test('opens without crashing', async () => {
  const {getByText} = render(
    <TestApp>
      <ModalReset {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Reset')).toBeInTheDocument();
  fireEvent.click(getByText('Reset'));
  await waitFor(() => getByText('Reset Upgrade Status'));
  expect(getByText('Reset Upgrade Status')).toBeInTheDocument();
});

test('closes', async () => {
  const {getByText, queryByText} = render(
    <TestApp>
      <ModalReset {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Reset')).toBeInTheDocument();
  fireEvent.click(getByText('Reset'));
  await waitFor(() => getByText('Reset Upgrade Status'));
  fireEvent.click(getByText('Cancel'));
  await waitFor(() => {
    expect(queryByText('Reset Upgrade Status')).not.toBeInTheDocument();
  });
  expect(getByText('Reset')).toBeInTheDocument();
});

test('submit success', async () => {
  const currentDate = new Date('2019-05-14T11:01:58.135Z');
  global.Date = class extends Date {
    constructor(date) {
      if (date) {
        return super(date);
      }
      return currentDate;
    }
  };

  const {getByText} = render(
    <TestApp>
      <ModalReset {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Reset')).toBeInTheDocument();
  fireEvent.click(getByText('Reset'));
  await waitFor(() => getByText('Reset Upgrade Status'));
  fireEvent.click(getByText('Submit'));
  await waitFor(() => getByText('Reset Status Submitted'));
  expect(apiServiceRequestMock).toHaveBeenCalledTimes(1);
  expect(apiServiceRequestMock).toHaveBeenLastCalledWith(
    'Tower C',
    'sendUpgradeRequest',
    {
      nodes: ['testNode'],
      ugType: 10,
      urReq: {
        upgradeReqId: 'NMS1557831718135',
        urType: 30,
      },
    },
  );
  expect(getByText('Reset Status Submitted')).toBeInTheDocument();
});

test('submit fail', async () => {
  apiServiceRequestMock.mockImplementationOnce(() => Promise.reject());
  const {getByText} = render(
    <TestApp>
      <ModalReset {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Reset')).toBeInTheDocument();
  fireEvent.click(getByText('Reset'));
  await waitFor(() => getByText('Reset Upgrade Status'));
  fireEvent.click(getByText('Submit'));
  await waitFor(() => getByText('Reset Status Failed'));
  expect(getByText('Reset Status Failed')).toBeInTheDocument();
});
