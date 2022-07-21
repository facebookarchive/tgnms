/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

import ModalFullUpgrade from '../ModalFullUpgrade';
import React from 'react';
import nullthrows from '@fbcnms/util/nullthrows';
import {TestApp} from '@fbcnms/tg-nms/app/tests/testHelpers';
import {act, fireEvent, render, waitFor} from '@testing-library/react';

import * as serviceApiUtil from '@fbcnms/tg-nms/app/apiutils/ServiceAPIUtil';
import * as upgradeHelpers from '@fbcnms/tg-nms/app/helpers/UpgradeHelpers';

const apiServiceRequestMock = jest
  .spyOn(serviceApiUtil, 'apiServiceRequest')
  .mockImplementation(() => Promise.resolve());

jest
  .spyOn(upgradeHelpers, 'fetchUpgradeImages')
  .mockImplementation((networkName, onResponse) =>
    onResponse([
      {
        name: 'testImage',
        magnetUri: 'testImage',
        md5: 'testImage',
        hardwareBoardIds: ['testImage'],
      },
    ]),
  );

const defaultProps = {
  controllerVersion: {major: 1, minor: 0},
  excluded: [],
  selected: ['testNode'],
  networkName: 'Tower C',
};

test('renders without crashing', () => {
  const {getByText} = render(
    <TestApp>
      <ModalFullUpgrade {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Full Upgrade')).toBeInTheDocument();
});

test('opens without crashing', async () => {
  const {getByText} = render(
    <TestApp>
      <ModalFullUpgrade {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Full Upgrade')).toBeInTheDocument();
  fireEvent.click(getByText('Full Upgrade'));
  await waitFor(() => getByText('Full Upgrade Nodes'));
  expect(getByText('Full Upgrade Nodes')).toBeInTheDocument();
});

test('closes', async () => {
  const {getByText, queryByText} = render(
    <TestApp>
      <ModalFullUpgrade {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Full Upgrade')).toBeInTheDocument();
  fireEvent.click(getByText('Full Upgrade'));
  await waitFor(() => getByText('Nodes for upgrade:'));
  fireEvent.click(getByText('Cancel'));
  await waitFor(() => {
    expect(queryByText('Nodes for upgrade:')).not.toBeInTheDocument();
  });
  expect(getByText('Full Upgrade')).toBeInTheDocument();
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
      <ModalFullUpgrade {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Full Upgrade')).toBeInTheDocument();
  fireEvent.click(getByText('Full Upgrade'));
  await waitFor(() => getByText('Nodes for upgrade:'));
  const selectedImageInput = nullthrows(
    document.getElementById('imageSelector'),
  );
  fireEvent.click(selectedImageInput);
  fireEvent.keyDown(selectedImageInput, {key: 'ArrowDown', code: 40});
  fireEvent.keyDown(selectedImageInput, {key: 'Enter', code: 13});
  await act(async () => {
    fireEvent.click(getByText('Submit'));
  });
  await waitFor(() => getByText('Full Upgrade Submitted'));
  expect(apiServiceRequestMock).toHaveBeenCalledTimes(1);
  expect(apiServiceRequestMock).toHaveBeenLastCalledWith(
    'Tower C',
    'sendUpgradeRequest',
    {
      ugType: 20,
      nodes: [],
      excludeNodes: [],
      urReq: {
        urType: 40,
        upgradeReqId: 'NMS1557831718135',
        md5: 'testImage',
        imageUrl: 'testImage',
        scheduleToCommit: 0,
        torrentParams: {
          downloadLimit: -1,
          downloadTimeout: 180,
          maxConnections: -1,
          uploadLimit: -1,
        },
        hardwareBoardIds: ['testImage'],
      },
      timeout: 180,
      skipFailure: true,
      skipPopFailure: false,
      version: 'testImage',
      skipLinks: [],
      limit: 0,
      retryLimit: 3,
    },
  );
  expect(getByText('Full Upgrade Submitted')).toBeInTheDocument();
});

test('submit fail', async () => {
  apiServiceRequestMock.mockImplementationOnce(() => Promise.reject());
  const {getByText} = render(
    <TestApp>
      <ModalFullUpgrade {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Full Upgrade')).toBeInTheDocument();
  fireEvent.click(getByText('Full Upgrade'));
  await waitFor(() => getByText('Nodes for upgrade:'));
  const selectedImageInput = nullthrows(
    document.getElementById('imageSelector'),
  );
  fireEvent.click(selectedImageInput);
  fireEvent.keyDown(selectedImageInput, {key: 'ArrowDown', code: 40});
  fireEvent.keyDown(selectedImageInput, {key: 'Enter', code: 13});
  await act(async () => {
    fireEvent.click(getByText('Submit'));
  });
  await waitFor(() => getByText('Full Upgrade Failed'));
  expect(getByText('Full Upgrade Failed')).toBeInTheDocument();
});
