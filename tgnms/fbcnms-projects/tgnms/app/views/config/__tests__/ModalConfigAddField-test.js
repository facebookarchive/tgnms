/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict-local
 */

import 'jest-dom/extend-expect';
import ModalConfigAddField from '../ModalConfigAddField';
import React from 'react';
import {TestApp} from '../../../tests/testHelpers';
import {act, cleanup, fireEvent, render} from '@testing-library/react';
import {mockConfigTaskContextValue} from '../../../tests/data/NetworkConfig';

afterEach(cleanup);

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(() => null),
};

const mockHookValue = mockConfigTaskContextValue({onUpdate: jest.fn()});

jest
  .spyOn(require('../../../contexts/ConfigTaskContext'), 'useConfigTaskContext')
  .mockReturnValue(mockHookValue);

test('renders without crashing', () => {
  const {getByText} = render(
    <TestApp>
      <ModalConfigAddField {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Add New Field')).toBeInTheDocument();
});

test('does not render when closed', () => {
  const {queryByText} = render(
    <TestApp>
      <ModalConfigAddField {...defaultProps} isOpen={false} />
    </TestApp>,
  );
  expect(queryByText('Add New Field')).not.toBeInTheDocument();
});

test('properly displays form fields', () => {
  const {getByText} = render(
    <TestApp>
      <ModalConfigAddField {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Field')).toBeInTheDocument();
  expect(getByText('Type')).toBeInTheDocument();
  expect(getByText('Value')).toBeInTheDocument();
});

test('Cancel button click', () => {
  const {getByText} = render(
    <TestApp>
      <ModalConfigAddField {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Add New Field')).toBeInTheDocument();
  fireEvent.click(getByText('Cancel'));
  expect(defaultProps.onClose).toHaveBeenCalled();
});

test('Add Field button click error', () => {
  const {getByText} = render(
    <TestApp>
      <ModalConfigAddField {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Add New Field')).toBeInTheDocument();
  fireEvent.click(getByText('Add Field'));
  expect(getByText('Please enter a field.')).toBeInTheDocument();
});

test('Add Field button click success', () => {
  const {getByText, getByTestId} = render(
    <TestApp>
      <ModalConfigAddField {...defaultProps} />
    </TestApp>,
  );
  expect(getByText('Add New Field')).toBeInTheDocument();
  const input = getByTestId('field-name').children[1].children[0];
  act(() => {
    fireEvent.change(input, {
      target: {value: 'test'},
    });
  });
  act(() => {
    fireEvent.click(getByText('Add Field'));
  });
  expect(mockHookValue.onUpdate).toHaveBeenCalled();
});
