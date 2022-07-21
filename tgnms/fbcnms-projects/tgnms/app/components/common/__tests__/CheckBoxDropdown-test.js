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
import CheckBoxDropDown from '../CheckBoxDropdown';
import {TestApp} from '@fbcnms/tg-nms/app/tests/testHelpers';
import {fireEvent, render} from '@testing-library/react';

const defaultProps = {
  title: 'testTitle',
  name: 'testName',
  menuItems: [{value: 'testValue', title: 'testItemTitle'}],
  onChange: jest.fn(),
};

test('renders without crashing', () => {
  const {getByText} = render(
    <TestApp>
      <CheckBoxDropDown {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('testTitle')).toBeInTheDocument();
});

test('clicking opens checkboxes', () => {
  const {getByText} = render(
    <TestApp>
      <CheckBoxDropDown {...defaultProps} />
    </TestApp>,
  );
  fireEvent.click(getByText('testTitle'));
  expect(getByText('testItemTitle')).toBeInTheDocument();
});

test('clicking input calls onChange', () => {
  const {getByText} = render(
    <TestApp>
      <CheckBoxDropDown {...defaultProps} />
    </TestApp>,
  );
  fireEvent.click(getByText('testTitle'));
  expect(getByText('testItemTitle')).toBeInTheDocument();
  fireEvent.click(getByText('testItemTitle'));
  expect(defaultProps.onChange).toHaveBeenCalled();
});

test('clicking checkbox calls onChange', () => {
  const {getByText, getByTestId} = render(
    <TestApp>
      <CheckBoxDropDown {...defaultProps} />
    </TestApp>,
  );
  fireEvent.click(getByText('testTitle'));
  expect(getByTestId('checkbox')).toBeInTheDocument();
  fireEvent.click(getByTestId('checkbox'));
  expect(defaultProps.onChange).toHaveBeenCalled();
});
