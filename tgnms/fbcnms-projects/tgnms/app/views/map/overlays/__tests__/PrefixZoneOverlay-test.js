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
import {
  NetworkContextWrapper,
  mockFig0,
} from '@fbcnms/tg-nms/app/tests/testHelpers';
import {buildTopologyMaps} from '@fbcnms/tg-nms/app/helpers/TopologyHelpers';
import {act as hooksAct, renderHook} from '@testing-library/react-hooks';
import {useNetworkPrefixTable} from '../PrefixZoneOverlay';

import type {NetworkContextType} from '@fbcnms/tg-nms/app/contexts/NetworkContext';
import type {RenderResult} from '@testing-library/react-hooks';

test('creates a feature collection', async () => {
  const apiMock = setupApiMock();
  const {result} = await asyncTestHook(useNetworkPrefixTable, {
    wrapper: props => (
      <Wrapper {...props} networkVals={{...buildTopologyMaps(mockFig0())}} />
    ),
  });
  expect(apiMock).toHaveBeenCalledTimes(2);
  // just test that it created some features with a certain shape
  expect(result.current).toMatchObject({
    type: 'FeatureCollection',
    features: [
      {
        geometry: {},
        properties: {},
        type: 'Feature',
      },
    ],
  });
});

async function asyncTestHook<P, T>(
  hook: P => T,
  options?: {wrapper: React.ComponentType<{children: React.Node}>},
): Promise<RenderResult<T>> {
  const {wrapper} = options || {wrapper: Wrapper};
  let response: RenderResult<T> = {};
  await hooksAct(async () => {
    response = renderHook<P, T>(hook, {wrapper});
  });
  return response;
}

function Wrapper({
  children,
  networkVals,
}: {
  children: React.Node,
  networkVals?: $Shape<NetworkContextType>,
}) {
  return (
    <NetworkContextWrapper contextValue={networkVals}>
      {children}
    </NetworkContextWrapper>
  );
}

function setupApiMock() {
  const apiMock = jest.spyOn(
    require('@fbcnms/tg-nms/app/apiutils/ServiceAPIUtil'),
    'apiRequest',
  );
  apiMock.mockResolvedValueOnce({
    zonePrefixes: {
      site1: ['2620:10d:c089:af00::/56'],
    },
  });
  apiMock.mockResolvedValueOnce({
    nodePrefixes: {
      'site1-0': '2620:10d:c089:af00::/64',
      'site1-1': '2620:10d:c089:af00::/64',
      'site2-0': '2620:10d:c089:af00::/64',
      'site2-1': '2620:10d:c089:af00::/64',
      'site3-0': '2620:10d:c089:af00::/64',
      'site3-1': '2620:10d:c089:af00::/64',
      'site4-0': '2620:10d:c089:af00::/64',
      'site4-1': '2620:10d:c089:af00::/64',
    },
  });
  return apiMock;
}
