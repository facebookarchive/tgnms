/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

import LinkInterference from '../LinkInterference';
import React from 'react';
import {TestApp} from '@fbcnms/tg-nms/app/tests/testHelpers';
import {render} from '@testing-library/react';

const defaultProps = {
  linkInterference: {
    assetName: 'test',
    directions: [
      {label: 'testLabel', interference: [], totalINR: 10, health: 2},
    ],
  },
};

test('renders no interfence if no interfence exists', () => {
  const {getByText} = render(
    <TestApp>
      <LinkInterference />
    </TestApp>,
  );
  expect(getByText('No Interference Detected')).toBeInTheDocument();
});

test('renders interfence', () => {
  const {getByText} = render(
    <TestApp>
      <LinkInterference {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('test')).toBeInTheDocument();
  expect(getByText('10.00 dB')).toBeInTheDocument();
});
