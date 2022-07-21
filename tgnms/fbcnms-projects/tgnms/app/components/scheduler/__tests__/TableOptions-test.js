/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

import * as React from 'react';
import TableOptions from '../TableOptions';
import {TestApp} from '@fbcnms/tg-nms/app/tests/testHelpers';
import {fireEvent, render} from '@testing-library/react';

const defaultProps = {
  onOptionsUpdate: jest.fn(),
  optionsInput: [],
};

test('renders without crashing', () => {
  const {getByText} = render(
    <TestApp>
      <TableOptions {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('30 days ago')).toBeInTheDocument();
});

test('onClick changes value of filter', () => {
  const {getByText, queryByText, getAllByText} = render(
    <TestApp>
      <TableOptions {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('30 days ago')).toBeInTheDocument();
  expect(queryByText('A year ago')).not.toBeInTheDocument();
  fireEvent.mouseDown(getByText('30 days ago'));
  fireEvent.click(getByText('A year ago'));
  expect(getAllByText('A year ago')[0]).toBeInTheDocument();
});

test('onClick changes value of filter', () => {
  const {getByText} = render(
    <TestApp>
      <TableOptions {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('30 days ago')).toBeInTheDocument();
  fireEvent.mouseDown(getByText('30 days ago'));
  fireEvent.click(getByText('Yesterday'));
  expect(defaultProps.onOptionsUpdate).toHaveBeenCalled();
});
