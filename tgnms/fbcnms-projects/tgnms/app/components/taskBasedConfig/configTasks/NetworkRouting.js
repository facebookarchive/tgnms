/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import * as React from 'react';
import ConfigOptionSelector from '../ConfigOptionSelector';
import ConfigTaskGroup from '../ConfigTaskGroup';

export default function NetworkRouting() {
  return (
    <ConfigTaskGroup
      title="Routing"
      description="The mode of routing used by the network to send and recieve packets">
      <ConfigOptionSelector
        options={{
          kernel: {
            name: 'Kernel',
            description: 'Linux kernel routing',
            setConfigs: [
              {
                set: '0',
                configField: 'envParams.DPDK_ENABLED',
              },
              {
                set: '0',
                configField: 'envParams.OPENR_USE_FIB_VPP',
              },
            ],
          },
          DPDK_VPP: {
            name: 'DPDK/VPP',
            description: 'User-space routing using DPDK and VPP',
            setConfigs: [
              {
                set: '1',
                configField: 'envParams.DPDK_ENABLED',
              },
              {
                set: '1',
                configField: 'envParams.OPENR_USE_FIB_VPP',
              },
            ],
          },
        }}
      />
    </ConfigTaskGroup>
  );
}
