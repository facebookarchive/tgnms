/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

import AssetTestResult from '../AssetTestResult';
import MaterialTheme from '@fbcnms/tg-nms/app/MaterialTheme';
import React from 'react';
import {
  NetworkContextWrapper,
  TestApp,
} from '@fbcnms/tg-nms/app/tests/testHelpers';
import {fireEvent, render} from '@testing-library/react';

const defaultProps = {
  assetName: 'testLink',
  executionResults: [],
  targetThroughput: 0,
};

test('renders', () => {
  const {getAllByText} = render(
    <TestApp>
      <MaterialTheme>
        <AssetTestResult {...defaultProps} />
      </MaterialTheme>
    </TestApp>,
  );
  expect(getAllByText('testLink').length).toBe(2);
});

test('if no test result, give error message', () => {
  const {getByText} = render(
    <TestApp>
      <MaterialTheme>
        <AssetTestResult {...defaultProps} />
      </MaterialTheme>
    </TestApp>,
  );

  expect(
    getByText('Could not find test results', {exact: false}),
  ).toBeInTheDocument();
});

test('removes selected element when back button is clicked', () => {
  const removeElement = jest.fn();
  const {getByTestId} = render(
    <TestApp>
      <NetworkContextWrapper
        contextValue={{
          selectedElement: {expanded: true, name: 'testLinkName', type: 'link'},
          removeElement,
        }}>
        <MaterialTheme>
          <AssetTestResult {...defaultProps} />
        </MaterialTheme>
      </NetworkContextWrapper>
    </TestApp>,
  );
  fireEvent.click(getByTestId('back-button'));
  expect(removeElement).toHaveBeenCalled();
});
