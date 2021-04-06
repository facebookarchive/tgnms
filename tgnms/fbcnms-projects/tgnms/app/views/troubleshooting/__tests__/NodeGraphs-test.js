/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict-local
 */

import NodeGraphs from '../NodeGraphs';
import React from 'react';
import {NetworkContextWrapper, TestApp} from '../../../tests/testHelpers';
import {mockNetworkContext} from '../../../tests/data/NetworkContext';
import {render} from '@testing-library/react';

jest
  .spyOn(require('../../../contexts/NetworkContext'), 'useNetworkContext')
  .mockImplementation(jest.fn(() => mockNetworkContext()));

const defaultProps = {
  nodeName: '',
  data: null,
  startTime: 0,
  endTime: 1,
};

test('renders', () => {
  const {getByText} = render(
    <TestApp route="/nodes">
      <NetworkContextWrapper>
        <NodeGraphs {...defaultProps} />
      </NetworkContextWrapper>
    </TestApp>,
  );

  expect(getByText('Availability')).toBeInTheDocument();
  expect(getByText('L4 Transport')).toBeInTheDocument();
});
