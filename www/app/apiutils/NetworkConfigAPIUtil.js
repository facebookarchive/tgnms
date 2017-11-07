// util class for making API calls to the node server for network config
import axios from 'axios';
var _ = require('lodash');

import {
  getBaseConfigSuccess,
  getNetworkConfigSuccess,
  getNodeConfigSuccess,

  setNetworkConfigSuccess,
  setNodeConfigSuccess,
} from '../actions/NetworkConfigActions.js';

// TODO: get rid of imageVersions since the API does not need it
export const getBaseConfig = (topologyName, imageVersions) => {
  const uri = '/controller/getBaseConfig';

  return axios.get(uri, {
    params: {
      topologyName,
      imageVersions: imageVersions,
    }
  }).then((response) => {
    const {config} = response.data;
    getBaseConfigSuccess({
      config,
      topologyName,
    });
  });
}

export const getNetworkOverrideConfig = (topologyName) => {
  const uri = '/controller/getNetworkOverrideConfig';

  axios.get(uri, {
    params: {
      topologyName,
    }
  }).then((response) => {
    const {config} = response.data;
    getNetworkConfigSuccess({
      config,
      topologyName,
    });
  });
};

export const getNodeOverrideConfig = (nodeMacs, topologyName) => {
  const uri = '/controller/getNodeOverrideConfig';

  axios.get(uri, {
    params: {
      nodes: nodeMacs,
      topologyName,
    }
  }).then((response) => {
    const {config} = response.data;
    getNodeConfigSuccess({
      config,
      topologyName,
    });
  });
};

export const setNetworkOverrideConfig = (config) => {
  console.log('submitting network config', config);
  const uri = '/controller/setNetworkOverrideConfig';

  axios.post(uri, {
    config: config
  }).then((response) => {
    setNetworkConfigSuccess({config});
  });
};

export const setNodeOverrideConfig = (config, nodesWithChanges, saveSelected) => {
  // TODO: filter by nodes with changes
  console.log('submitting node config', config, nodesWithChanges);
  const uri = '/controller/setNodeOverrideConfig';

  axios.post(uri, {
    config: config
  }).then((response) => {
    setNodeConfigSuccess({config, saveSelected});
  });
};

const mockConfigJSON = {
  "sysParams": {
    "managedConfig": true
  },
  "envParams": {
    "OPENR_ENABLED": "1",
    "OPENR_ALLOC_PREFIX": "1",
    "OPENR_USE_RTT_METRIC": "",
    "OPENR_USE_FIB_NSS": "1",
    "FW_NSS": "1",
    "OPENR_USE_FIB_LINUX": "",
    "OOB_NETNS": "1",
    "OOB_INTERFACE": "nic0",
    "CPE_INTERFACE": "",
    "E2E_ENABLED": "",
    "FW_IF2IF": "",
    "SYSTEM_LOGS_ENABLED": "1",
    "TOPOLOGY_FILE": "/data/e2e_topology.conf"
  },
  "fwParams": {
    "nodeInitOptParams": {
      "antCodeBook": 1,
      "numOfPeerSta": 1,
      "bfMode": 1,
      "bwHandlerMode": 2,
      "gpioConfig": 0,
      "numOfHbLossToFail": 10,
      "statsLogInterval": 625,
      "statsPrintInterval": 1024,
      "forceGpsDisable": 0,
      "lsmAssocRespTimeout": 500,
      "lsmSendAssocReqRetry": 5,
      "lsmAssocRespAckTimeout": 500,
      "lsmSendAssocRespRetry": 5,
      "lsmRepeatAckInterval": 50,
      "lsmRepeatAck": 1,
      "lsmFirstHeartbTimeout": 260,
      "txSlot0Start": 6,
      "txSlot0End": 86,
      "txSlot1Start": 96,
      "txSlot1End": 181,
      "txSlot2Start": 191,
      "txSlot2End": 196,
      "rxSlot0Start": 4,
      "rxSlot0End": 86,
      "rxSlot1Start": 94,
      "rxSlot1End": 181,
      "rxSlot2Start": 189,
      "rxSlot2End": 196,
      "txPower": 28,
      "rxBuffer": 63,
      "beamConfig": 2,
      "txBeamIndex": 5,
      "rxBeamIndex": 10,
      "maxAgcTrackingEnabled": 1,
      "maxAgcTrackingMargindB": 7,
      "bfAgc": 32837,
      "linkAgc": 33279,
      "crsScale" : 24,
      "tpcEnable": 3,
      "tpcRefRssi": -36,
      "tpcRefStfSnrStep1": 20,
      "tpcRefStfSnrStep2": 17,
      "tpcRefStfSnrStep3": 14,
      "tpcDelPowerStep1": 10,
      "tpcDelPowerStep2": 8,
      "tpcDelPowerStep3": 1,
      "tpcMinTxPowerIndex": 0,
      "tpcAlphaUpRssiStep3Q10" : 1014,
      "tpcAlphaDownRssiStep3Q10" : 768,
      "tpcAlphaUpTargetRssiStep3Q10" : 829,
      "tpcAlphaDownTargetRssiStep3Q10" : 1004,
      "mcs": 34,
      "laInvPERTarget" : 200,
      "laConvergenceFactor" : 380,
      "laMaxMcs" : 9,
      "laMinMcs" : 2,
      "noLinkTimeout": 15,
      "wsecEnable": 0,
      "key0": 1,
      "key1": 2,
      "key2": 3,
      "key3": 4,
      "measSlotEnable": 0,
      "measSlotPeriod": 8
    },
    "linkOptParams": {
      "txPower": 28,
      "rxBuffer": 63,
      "beamConfig": 2,
      "txBeamIndex": 5,
      "rxBeamIndex": 10,
      "mcs": 34,
      "respNodeType": 1,
      "measSlotOffset": 255
    }
  },
  "logTailParams": {
    "sources": {
      "terragraph_kern_logs": {
        "enabled": true,
        "filename": "/var/log/kern.log"
      },
      "terragraph_minion_logs": {
        "enabled": true,
        "filename": "/var/log/e2e_minion/current"
      },
      "terragraph_openr_logs": {
        "enabled": true,
        "filename": "/var/log/openr/current"
      }
    }
  },
  "statsAgentParams": {
    "sources": {
      "minion": {
        "enabled": true,
        "zmq_url": "tcp://[::1]:18989"
      },
      "openr": {
        "enabled": true,
        "zmq_url": "tcp://[::1]:60007"
      },
      "driver-if": {
        "enabled": true,
        "zmq_url": "tcp://[::1]:18990"
      },
      "system": {
        "enabled": true,
        "zmq_url": "ipc://stats-monitor-pub"
      },
      "controller": {
        "enabled": true,
        "zmq_url": "tcp://[::1]:28989"
      }
    }
  }
};
