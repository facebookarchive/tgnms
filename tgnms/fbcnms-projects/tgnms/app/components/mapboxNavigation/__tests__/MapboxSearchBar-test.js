/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict-local
 */

import MapboxSearchBar from '../MapboxSearchBar';
import React from 'react';
import {TestApp} from '../../../tests/testHelpers';
import {cleanup, render} from '@testing-library/react';

const defaultProps = {
  accessToken: 'testToken',
  mapRef: null,
  onSelectFeature: jest.fn(),
  getCustomResults: jest.fn(),
  shouldSearchPlaces: jest.fn(),
  onRenderResult: jest.fn(),
};

beforeEach(() => {
  cleanup();
  jest.clearAllMocks();
});

test('renders', () => {
  const {getByTestId} = render(
    <TestApp>
      <MapboxSearchBar {...defaultProps} />
    </TestApp>,
  );
  expect(getByTestId('mapbox-search-bar')).toBeInTheDocument();
});
