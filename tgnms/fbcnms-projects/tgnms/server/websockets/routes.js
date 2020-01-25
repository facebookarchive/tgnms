/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow
 */

import websocketService from './service';

const express = require('express');
const router = express.Router();

// $FlowFixMe
router.ws('/', ws => {
  ws.on('message', (messageJson: string) => {
    try {
      const parsed = JSON.parse(messageJson);
      websocketService.processCommand(parsed, ws);
    } catch (err) {
      ws.send();
    }
  });
  ws.on('close', () => {
    websocketService.leaveAllGroups(ws);
  });
});

module.exports = router;
