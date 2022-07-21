/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

import NodeUpgradeTable from '../NodeUpgradeTable';
import React from 'react';
import {TestApp, renderAsync} from '@fbcnms/tg-nms/app/tests/testHelpers';
import {fireEvent, render} from '@testing-library/react';
import {mockUpgradeArrayData} from '@fbcnms/tg-nms/app/tests/data/Upgrade';

const defaultProps = {
  controllerVersion: 'testVersion',
  data: mockUpgradeArrayData(),
  networkName: 'testNetwork',
};

test('renders empty without crashing', () => {
  const {getByText} = render(
    <TestApp>
      <NodeUpgradeTable {...defaultProps} data={[]} />
    </TestApp>,
  );
  expect(getByText('Node Upgrade Status')).toBeInTheDocument();
  expect(getByText('There is no data to display')).toBeInTheDocument();
});

test('renders nodes', () => {
  const {getByText} = render(
    <TestApp>
      <NodeUpgradeTable {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Node Upgrade Status')).toBeInTheDocument();
  expect(getByText('test1')).toBeInTheDocument();
  expect(getByText('test4')).toBeInTheDocument();
});

test('clicking node selects node', () => {
  const {getByText} = render(
    <TestApp>
      <NodeUpgradeTable {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Node Upgrade Status')).toBeInTheDocument();
  fireEvent.click(getByText('test1'));
  expect(getByText('1 selected')).toBeInTheDocument();
});

test('clicking multiple nodes selects all nodes', () => {
  const {getByText} = render(
    <TestApp>
      <NodeUpgradeTable {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Node Upgrade Status')).toBeInTheDocument();
  fireEvent.click(getByText('test1'));
  fireEvent.click(getByText('test2'));
  expect(getByText('2 selected')).toBeInTheDocument();
});

test('clicking select all selects all nodes', async () => {
  const {getByText, getByTestId} = await renderAsync(
    <TestApp>
      <NodeUpgradeTable {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Node Upgrade Status')).toBeInTheDocument();
  fireEvent.click(getByTestId('selectAllBox').children[0].children[0]);
  expect(getByText('4 selected')).toBeInTheDocument();
});

test('clicking select all while nodes are selected deselects all nodes', async () => {
  const {getByText, queryByText, getByTestId} = await renderAsync(
    <TestApp>
      <NodeUpgradeTable {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Node Upgrade Status')).toBeInTheDocument();
  fireEvent.click(getByText('test1'));
  fireEvent.click(getByText('test2'));
  expect(getByText('2 selected')).toBeInTheDocument();
  expect(queryByText('Node Upgrade Status')).not.toBeInTheDocument();
  fireEvent.click(getByTestId('selectAllBox').children[0].children[0]);
  expect(getByText('Node Upgrade Status')).toBeInTheDocument();
});

test('clicking node brings up upgrade buttons', () => {
  const {getByText, getByTestId} = render(
    <TestApp>
      <NodeUpgradeTable {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Node Upgrade Status')).toBeInTheDocument();
  fireEvent.click(getByText('test1'));
  expect(getByTestId('actionButtonContainer')).toBeInTheDocument();
});
