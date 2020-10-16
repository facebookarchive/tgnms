/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict-local
 */
import 'jest-dom/extend-expect';
import React from 'react';
import ScanServicePanel from '../ScanServicePanel';
import {TestApp, renderWithRouter} from '../../../../tests/testHelpers';
import {cleanup} from '@testing-library/react';

afterEach(cleanup);

const defaultProps = {
  expanded: true,
  scanId: null,
};

test('doest not render table if there is no scan ID', () => {
  const {queryByText} = renderWithRouter(
    <ScanServicePanel {...defaultProps} />,
  );
  expect(queryByText('Scan Service')).not.toBeInTheDocument();
});

test('renders table if there is a scan ID', () => {
  const {getByText} = renderWithRouter(
    <TestApp>
      <ScanServicePanel {...defaultProps} scanId={'1'} />
    </TestApp>,
  );
  expect(getByText('Scan Service')).toBeInTheDocument();
});
