/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 */

const {
  BinaryStarFsmState,
} = require('../../thrift/gen-nodejs/Controller_types');

const HAPeerType = {
  PRIMARY: 'PRIMARY',
  BACKUP: 'BACKUP',
  ERROR: 'ERROR',
};

function determineActiveController(bStarStatePrimary, bStarStateBackup) {
  const haState = {active: HAPeerType.PRIMARY};
  // no active primary controller
  if (bStarStatePrimary === null) {
    if (bStarStateBackup === null) {
      // both controllers offline
      haState.active = HAPeerType.ERROR;
    } else if (
      bStarStateBackup !== null &&
      bStarStateBackup === BinaryStarFsmState.STATE_ACTIVE
    ) {
      // backup online
      haState.active = HAPeerType.BACKUP;
    }
  }
  // both controllers responding
  if (bStarStatePrimary !== null && bStarStateBackup !== null) {
    // chose the active controller
    if (bStarStateBackup === BinaryStarFsmState.STATE_ACTIVE) {
      haState.active = HAPeerType.BACKUP;
    }
    // both controllers in ACTIVE state
    if (
      bStarStatePrimary === BinaryStarFsmState.STATE_ACTIVE &&
      bStarStateBackup === BinaryStarFsmState.STATE_ACTIVE
    ) {
      haState.active = HAPeerType.ERROR;
      haState.error = 'Both controllers ACTIVE';
    }
    if (
      bStarStatePrimary === BinaryStarFsmState.STATE_PASSIVE &&
      bStarStateBackup === BinaryStarFsmState.STATE_PASSIVE
    ) {
      haState.active = HAPeerType.ERROR;
      haState.error = 'Both controllers PASSIVE';
    }
  }
  return haState;
}

module.exports = {
  determineActiveController,
  HAPeerType,
};
