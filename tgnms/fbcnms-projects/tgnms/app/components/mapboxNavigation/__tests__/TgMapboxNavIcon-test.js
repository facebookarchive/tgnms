/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import TgMapboxNavIcon from '../TgMapboxNavIcon';
import {TopologyElementType} from '../../../constants/NetworkConstants';
import {render} from '@testing-library/react';

const defaultProps = {
  resultType: TopologyElementType.NODE,
};

test('renders', () => {
  const {getByTestId} = render(<TgMapboxNavIcon {...defaultProps} />);
  expect(getByTestId('node-search-icon')).toBeInTheDocument();
});
