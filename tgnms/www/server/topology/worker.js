/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 */

import axios from 'axios';
import isIp from 'is-ip';
import process from 'process';

const {
  HAPeerType,
  getPeerAPIServiceHost,
} = require('../highAvailability/model');
const logger = require('../log')(module);

// main message loop from primary process
process.on('message', msg => {
  logger.debug('received message %s', msg.type);
  if (!msg.type) {
    logger.error('received unknown message: %s', msg);
  }

  const getErrorHandler = function(type) {
    return error => {
      logger.error(error.message);
    };
  };

  // wait for a message to start polling
  switch (msg.type) {
    case 'poll':
      // expect a list of IP addresses
      msg.topologies.forEach(topology => {
        const getSuccessHandler = function(type, fieldName) {
          return ([success, responseTime, data]) => {
            process.send({
              name: topology.name,
              type,
              success,
              response_time: responseTime,
              controller_ip: topology.controller_ip_active,
              [fieldName]: success ? data : null,
            });
          };
        };
        apiServiceRequest(topology, 'getTopology')
          .then(getSuccessHandler('topology_update', 'topology'))
          .catch(getErrorHandler('topology_update'));
        apiServiceRequest(topology, 'getCtrlStatusDump')
          .then(getSuccessHandler('status_dump_update', 'status_dump'))
          .catch(getErrorHandler('status_dump_update'));
        apiServiceRequest(topology, 'getIgnitionState')
          .then(getSuccessHandler('ignition_state', 'ignition_state'))
          .catch(getErrorHandler('ignition_state'));
        apiServiceRequest(topology, 'getUpgradeState')
          .then(getSuccessHandler('upgrade_state', 'upgradeState'))
          .catch(getErrorHandler('upgrade_state'));
      });
      break;
    case 'scan_poll':
      msg.topologies.forEach(topology => {
        const scanStatusPostData = {
          isConcise: false,
        };
        apiServiceRequest(topology, 'getScanStatus', scanStatusPostData)
          .then(([success, responseTime, data]) => {
            process.send({
              name: topology.name,
              scan_status: success ? data : null,
              success: success && data,
              type: 'scan_status',
            });

            const clearScanEnable = true; // for development
            if (!success || !data || !clearScanEnable) {
              return;
            }
            if (Object.keys(data.scans).length === 0) {
              return;
            }

            // this clears the scan memory from the controller
            const statusKeys = Object.keys(data.scans);
            const scanResetPostData = {
              tokenFrom: Math.min.apply(null, statusKeys),
              tokenTo: Math.max.apply(null, statusKeys),
            };
            apiServiceRequest(topology, 'resetScanStatus', scanResetPostData)
              .then(_ => logger.debug('Reset scan status success'))
              .catch(getErrorHandler('scan_status_reset'));
          })
          .catch(getErrorHandler('scan_status'));
      });
      break;
    default:
      logger.error('no handler for msg type %s', msg.type);
  }
});

function apiServiceRequest(topology, apiMethod, data, config) {
  const activeControllerIp =
    topology.controller_ip_active || topology.controller_ip;
  const baseUrl =
    activeControllerIp === topology.controller_ip
      ? getPeerAPIServiceHost(topology, HAPeerType.PRIMARY)
      : getPeerAPIServiceHost(topology, HAPeerType.BACKUP);

  const postData = data || {};
  // All apiservice requests are POST, and expect at least an empty dict.
  return new Promise((resolve, reject) => {
    const startTimer = new Date();
    const url = `${baseUrl}/api/${apiMethod}`;
    retryAxios([100, 500, 1000], axios.post, url, postData, config)
      .then(response => {
        const endTimer = new Date();
        const responseTime = endTimer - startTimer;
        const success = true;
        resolve([success, responseTime, response.data]);
      })
      .catch(error => {
        if (error.response) {
          logger.error(
            'received status %s for url %s',
            error.response.status,
            url,
          );
        } else {
          logger.error(error.message);
        }
        const endTimer = new Date();
        const responseTime = endTimer - startTimer;
        const success = false;
        const data = error.response ? error.response.data : null;
        resolve([success, responseTime, data]);
      });
  });
}

const retryAxios = async (delays, axiosFunc, ...axiosArgs) => {
  // Extract the iterator from the iterable.
  const timeout = ms => new Promise(res => setTimeout(res, ms));
  const iterator = delays[Symbol.iterator]();
  while (true) {
    try {
      // Always call the service at least once.
      return await axiosFunc(...axiosArgs);
    } catch (error) {
      const {done, value} = iterator.next();
      if (!done && error.response && error.response.status === 400) {
        logger.debug('retrying ' + value);
        await timeout(value);
      } else {
        // The error is not retriable or the iterable is exhausted.
        throw error;
      }
    }
  }
};

module.exports = {};
