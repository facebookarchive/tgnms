/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

import * as notistack from 'notistack';
import React from 'react';

import useSnackbar from '../useSnackbar';
import {renderHook} from '@testing-library/react-hooks';

jest.mock('@material-ui/core/Slide', () => () => <div />);
jest.mock('notistack');

it('renders without crashing', () => {
  const mockEnqueueSnackbar = jest.fn().mockReturnValue('key');
  const mockCloseSnackbar = jest.fn();
  jest.spyOn(notistack, 'useSnackbar').mockImplementation(() => ({
    enqueueSnackbar: mockEnqueueSnackbar,
    closeSnackbar: mockCloseSnackbar,
  }));

  const {rerender} = renderHook(
    message => useSnackbar(message, {variant: 'error'}, true),
    {initialProps: 'test1'},
  );

  expect(mockEnqueueSnackbar).toHaveBeenCalledTimes(1);
  expect(mockCloseSnackbar).toHaveBeenCalledTimes(0);

  rerender('test2');
  expect(mockEnqueueSnackbar).toHaveBeenCalledTimes(2);
  expect(mockCloseSnackbar).toHaveBeenCalledTimes(0);
});

it('dismisses previous', () => {
  const mockEnqueueSnackbar = jest.fn().mockReturnValue('key');
  const mockCloseSnackbar = jest.fn();
  jest.spyOn(notistack, 'useSnackbar').mockImplementation(() => ({
    enqueueSnackbar: mockEnqueueSnackbar,
    closeSnackbar: mockCloseSnackbar,
  }));

  const {rerender} = renderHook(
    message => useSnackbar(message, {variant: 'error'}, true, true),
    {initialProps: 'test1'},
  );

  expect(mockEnqueueSnackbar).toHaveBeenCalledTimes(1);
  expect(mockCloseSnackbar).toHaveBeenCalledTimes(0);

  rerender('test2');

  expect(mockEnqueueSnackbar).toHaveBeenCalledTimes(2);
  expect(mockCloseSnackbar).toHaveBeenCalledTimes(1);
});
