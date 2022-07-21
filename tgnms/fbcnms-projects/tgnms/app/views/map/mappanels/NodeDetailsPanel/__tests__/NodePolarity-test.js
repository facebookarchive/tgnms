/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

import NodePolarity from '../NodePolarity';
import React from 'react';
import {TestApp, renderWithRouter} from '@fbcnms/tg-nms/app/tests/testHelpers';

import {
  mockNetworkConfig,
  mockNode,
} from '@fbcnms/tg-nms/app/tests/data/NetworkConfig';

import type {TopologyConfig} from '@fbcnms/tg-nms/shared/dto/NetworkState';

const defaultProps = {
  ctrlVersion:
    'Facebook Terragraph Release RELEASE_M43_PRE-77-g4044506c6-ljoswiak (ljoswiak@devvm1074 Tue Sep  3 22:01:21 UTC 201',
  node: mockNode({wlan_mac_addrs: ['test1', 'test2']}),
  networkConfig: mockNetworkConfig({
    topologyConfig: ({
      polarity: {test1: 1, test2: 1},
    }: $Shape<TopologyConfig>),
  }),
};

test('renders empty without crashing', () => {
  const {getByText} = renderWithRouter(
    <TestApp>
      <NodePolarity {...defaultProps} node={mockNode()} />,
    </TestApp>,
  );
  expect(getByText(',')).toBeInTheDocument();
});

test('renders with props', () => {
  const {getByText} = renderWithRouter(
    <TestApp>
      <NodePolarity {...defaultProps} />,
    </TestApp>,
  );
  expect(getByText('Polarity')).toBeInTheDocument();
  expect(getByText('test1')).toBeInTheDocument();
  expect(getByText('test2')).toBeInTheDocument();
});
