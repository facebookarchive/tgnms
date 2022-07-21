/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import moment from 'moment';
const {fetchNetworkHealthFromDb} = require('../model');
const {link_event} = require('../../models');

jest.mock('request');
jest.mock('../../models');

describe('basic db tests', () => {
  test('link up both directions', async () => {
    // online for one hour
    const networkName = 'test net';
    const linkName = 'link-A-B';
    const startTs = moment().subtract(10, 'hours').toDate().getTime();
    const endTs = moment().subtract(4, 'hours').toDate().getTime();
    // create link up interval, ensure % availability
    await link_event.bulkCreate([
      {
        id: 1,
        topologyName: networkName,
        linkName: linkName,
        linkDirection: 'A',
        eventType: 'LINK_UP',
        startTs: startTs,
        endTs: endTs,
      },
      {
        id: 2,
        topologyName: networkName,
        linkName: linkName,
        linkDirection: 'Z',
        eventType: 'LINK_UP',
        startTs: startTs,
        endTs: endTs,
      },
    ]);
    const networkHealth = await fetchNetworkHealthFromDb(networkName, 24);
    // link up for 25% of the 24-hour window
    expect(networkHealth.events[linkName].linkAlive).toBe(25);
    expect(networkHealth.events[linkName].linkAvailForData).toBe(25);
  });
});
