/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

import ModalConfigGet from '../ModalConfigGet';
import React from 'react';
import {TestApp, mockNetworkConfig} from '@fbcnms/tg-nms/app/tests/testHelpers';
import {fireEvent, render} from '@testing-library/react';

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(() => null),
  networkConfig: mockNetworkConfig(),
  networkName: 'test',
  nodeInfo: {
    name: '',
    macAddr: 'test',
    isAlive: false,
    version: null,
    firmwareVersion: null,
    hardwareBoardId: null,
    hasOverride: false,
    isCn: false,
    isPop: false,
  },
};

test('renders without crashing', () => {
  const {getByText} = render(
    <TestApp>
      <ModalConfigGet {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Full Node Configuration')).toBeInTheDocument();
});

test('does not render when closed', () => {
  const {queryByText} = render(
    <TestApp>
      <ModalConfigGet {...defaultProps} isOpen={false} />
    </TestApp>,
  );
  expect(queryByText('Full Node Configuration')).not.toBeInTheDocument();
});

test('Close button click', () => {
  const {getByText} = render(
    <TestApp>
      <ModalConfigGet {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Full Node Configuration')).toBeInTheDocument();
  fireEvent.click(getByText('Close'));
  expect(defaultProps.onClose).toHaveBeenCalled();
});
