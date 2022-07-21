/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

import ModalPrepare from '../ModalPrepare';
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
  selected: ['testNode'],
  networkName: 'Tower C',
};

test('renders without crashing', () => {
  const {getByText} = render(
    <TestApp>
      <ModalPrepare {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Prepare')).toBeInTheDocument();
});

test('opens without crashing', async () => {
  const {getByText} = render(
    <TestApp>
      <ModalPrepare {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Prepare')).toBeInTheDocument();
  fireEvent.click(getByText('Prepare'));
  await waitFor(() => getByText('Nodes to prepare for upgrade:'));
  expect(getByText('Nodes to prepare for upgrade:')).toBeInTheDocument();
});

test('closes', async () => {
  const {getByText, queryByText} = render(
    <TestApp>
      <ModalPrepare {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Prepare')).toBeInTheDocument();
  fireEvent.click(getByText('Prepare'));
  await waitFor(() => getByText('Nodes to prepare for upgrade:'));
  fireEvent.click(getByText('Cancel'));
  await waitFor(() => {
    expect(
      queryByText('Nodes to prepare for upgrade:'),
    ).not.toBeInTheDocument();
  });
  expect(getByText('Prepare')).toBeInTheDocument();
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
      <ModalPrepare {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Prepare')).toBeInTheDocument();
  fireEvent.click(getByText('Prepare'));
  await waitFor(() => getByText('Nodes to prepare for upgrade:'));
  const selectedImageInput = nullthrows(
    document.getElementById('imageSelector'),
  );
  fireEvent.click(selectedImageInput);
  fireEvent.keyDown(selectedImageInput, {key: 'ArrowDown', code: 40});
  fireEvent.keyDown(selectedImageInput, {key: 'Enter', code: 13});
  await act(async () => {
    fireEvent.click(getByText('Submit'));
  });
  await waitFor(() => getByText('Prepare Upgrade Initiated'));
  expect(apiServiceRequestMock).toHaveBeenCalledTimes(1);
  expect(apiServiceRequestMock).toHaveBeenLastCalledWith(
    'Tower C',
    'sendUpgradeRequest',
    {
      limit: 0,
      nodes: ['testNode'],
      retryLimit: 3,
      skipFailure: true,
      skipLinks: [],
      timeout: 180,
      ugType: 10,
      urReq: {
        hardwareBoardIds: ['testImage'],
        imageUrl: 'testImage',
        md5: 'testImage',
        torrentParams: {
          downloadLimit: -1,
          downloadTimeout: 180,
          maxConnections: -1,
          uploadLimit: -1,
        },
        upgradeReqId: 'NMS1557831718135',
        urType: 10,
      },
      version: 'testImage',
    },
  );
  expect(getByText('Prepare Upgrade Initiated')).toBeInTheDocument();
});

test('submit fail', async () => {
  apiServiceRequestMock.mockImplementationOnce(() => Promise.reject());
  const {getByText} = render(
    <TestApp>
      <ModalPrepare {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Prepare')).toBeInTheDocument();
  fireEvent.click(getByText('Prepare'));
  await waitFor(() => getByText('Nodes to prepare for upgrade:'));
  const selectedImageInput = nullthrows(
    document.getElementById('imageSelector'),
  );
  fireEvent.click(selectedImageInput);
  fireEvent.keyDown(selectedImageInput, {key: 'ArrowDown', code: 40});
  fireEvent.keyDown(selectedImageInput, {key: 'Enter', code: 13});
  await act(async () => {
    fireEvent.click(getByText('Submit'));
  });
  await waitFor(() => getByText('Prepare Upgrade Failed'));
  expect(getByText('Prepare Upgrade Failed')).toBeInTheDocument();
});
