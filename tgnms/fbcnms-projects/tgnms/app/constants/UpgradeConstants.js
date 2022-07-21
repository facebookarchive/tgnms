/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import {UpgradeStatusTypeValueMap} from '@fbcnms/tg-nms/shared/types/Controller';
import {invert} from 'lodash';

export const REVERT_UPGRADE_IMAGE_STATUS = 5000;
export const UPGRADE_IMAGE_REFRESH_INTERVAL = 10000;

export const BatchingType = {
  ALL_AT_ONCE: 'all_at_once',
  AUTO_LIMITED: 'auto_limited',
  AUTO_UNLIMITED: 'auto_unlimited',
};

export const UpgradeStatusToString = invert(UpgradeStatusTypeValueMap);

export const UploadStatus = {
  NONE: 'NONE',
  UPLOADING: 'UPLOADING',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
};

export const SOFTWARE_PORTAL_SUITE = 'tg_firmware_rev5';
