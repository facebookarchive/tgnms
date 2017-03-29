const fs = require('fs');
const mysql = require('mysql');
const pool = mysql.createPool({
    connectionLimit:    50,
    dateStrings:        true,
    host:               '127.0.0.1',
    user:               'root',
    password:           '',
    database:           'cxl',
    queueLimit:         10,
    waitForConnections: false,
    multipleStatements: true,
});

const METRIC_KEY_NAMES = [
  'snr',
  'rssi',
  'mcs',
  'per',
  'tx_power',
  'rx_bytes',
  'tx_bytes',
  'rx_pps',
  'tx_pps',
  'rx_errors',
  'tx_errors',
  'rx_dropped',
  'tx_dropped',
  /* 'link_status' (published from controller node */
];

SUM_BY_KEY = "SELECT `key`, UNIX_TIMESTAMP(`time`) AS time, " +
               "SUM(`value`) AS value FROM `ts_value` " +
             "JOIN (`ts_time`) ON (`ts_time`.`id`=`ts_value`.`time_id`) " +
             "JOIN (`ts_key`) ON (`ts_key`.`id`=`ts_value`.`key_id`) " +
             "JOIN (`nodes`) ON (`nodes`.`id`=`ts_key`.`node_id`) " +
             "WHERE `mac` IN ? " +
             "AND `key` IN ? " +
             "AND `time` > DATE_SUB(NOW(), INTERVAL ? MINUTE) " +
             "GROUP BY `key`, `time`";
MAC_AND_KEY = "SELECT `ts_key`.`id`, `mac`, `key`, " +
                "UNIX_TIMESTAMP(`time`) AS time, `value` FROM `ts_value` " +
              "JOIN (`ts_time`) ON (`ts_time`.`id`=`ts_value`.`time_id`) " +
              "JOIN (`ts_key`) ON (`ts_key`.`id`=`ts_value`.`key_id`) " +
              "JOIN (`nodes`) ON (`nodes`.`id`=`ts_key`.`node_id`) " +
              "AND `ts_key`.`id` IN ? " +
              "AND `time` > DATE_SUB(NOW(), INTERVAL ? MINUTE) " +
              "ORDER BY `time` ASC";
KEY_VALUES = "SELECT `key`, UNIX_TIMESTAMP(`time`) AS time, " +
               "`value` FROM `ts_value` " +
             "JOIN (`ts_time`) ON (`ts_time`.`id`=`ts_value`.`time_id`) " +
             "JOIN (`ts_key`) ON (`ts_key`.`id`=`ts_value`.`key_id`) " +
             "JOIN (`nodes`) ON (`nodes`.`id`=`ts_key`.`node_id`) " +
             "AND `key` = ? " +
             "AND `time` > DATE_SUB(NOW(), INTERVAL 24 HOUR) " +
              "ORDER BY `time` ASC";
SUM_BY_MAC = "SELECT `mac`, UNIX_TIMESTAMP(`time`) AS time, " +
              "SUM(value) AS value FROM `ts_value` " +
              "JOIN (`ts_time`) ON (`ts_time`.`id`=`ts_value`.`time_id`) " +
              "JOIN (`ts_key`) ON (`ts_key`.`id`=`ts_value`.`key_id`) " +
              "JOIN (`nodes`) ON (`nodes`.`id`=`ts_key`.`node_id`) " +
              "WHERE `mac` IN ? " +
              "AND `key` IN ? " +
              "AND `time` > DATE_SUB(NOW(), INTERVAL ? MINUTE) " +
              "GROUP BY `mac`, `time`";
LINK_METRIC = "SELECT `key`, UNIX_TIMESTAMP(`time`) AS time, " +
             "SUM(value) AS value FROM `ts_value` " +
             "JOIN (`ts_time`) ON (`ts_time`.`id`=`ts_value`.`time_id`) " +
             "JOIN (`ts_key`) ON (`ts_key`.`id`=`ts_value`.`key_id`) " +
             "JOIN (`nodes`) ON (`nodes`.`id`=`ts_key`.`node_id`) " +
             "WHERE `mac` IN ? " +
             "AND `key` IN ? " +
             "AND `time` > DATE_SUB(NOW(), INTERVAL ? MINUTE) " +
             "GROUP BY `key`, `time`";

COUNT_ALIVE = "SELECT `mac`, `key`, COUNT(*) AS total FROM `ts_value` " +
              "JOIN (`ts_time`) ON (`ts_time`.`id`=`ts_value`.`time_id`) " +
              "JOIN (`ts_key`) ON (`ts_key`.`id`=`ts_value`.`key_id`) " +
              "JOIN (`nodes`) ON (`nodes`.`id`=`ts_key`.`node_id`) " +
              "WHERE `mac` IN ? " +
              "AND `key` IN ? " +
              "AND `time` > DATE_SUB(NOW(), INTERVAL 24 HOUR) " +
              "GROUP BY `mac`";
COUNT_SNR_OK = "SELECT `mac`, `key`, COUNT(*) AS total FROM `ts_value` " +
               "JOIN (`ts_time`) ON (`ts_time`.`id`=`ts_value`.`time_id`) " +
               "JOIN (`ts_key`) ON (`ts_key`.`id`=`ts_value`.`key_id`) " +
               "JOIN (`nodes`) ON (`nodes`.`id`=`ts_key`.`node_id`) " +
               "WHERE `mac` IN ? " +
               "AND `key` IN ? " +
               "AND `time` > DATE_SUB(NOW(), INTERVAL 24 HOUR) " +
               "AND `value` >= 12 " +
               "GROUP BY `mac`";
METRIC_NAMES = "SELECT `ts_key`.`id`, `mac`, `key` FROM `ts_key` " +
               "JOIN (`nodes`) ON (`nodes`.`id`=`ts_key`.`node_id`) " +
               "WHERE `mac` IN ?";

SYSLOG_BY_MAC = "SELECT `log` FROM `sys_logs` " +
                "JOIN (`log_sources`) ON (`log_sources`.`id`=`sys_logs`.`source_id`) " +
                "JOIN (`nodes`) ON (`nodes`.`id`=`log_sources`.`node_id`) " +
                "WHERE `mac` = ? " +
                "AND `filename` = ? " +
                "ORDER BY `sys_logs`.`id` DESC " +
                "LIMIT ?, ?;";

EVENTLOG_BY_MAC = "SELECT `sample` FROM `events` " +
                  "JOIN (`event_categories`) ON (`event_categories`.`id`=`events`.`category_id`) " +
                  "JOIN (`nodes`) ON (`nodes`.`id`=`event_categories`.`node_id`) " +
                  "WHERE `mac` IN ? " +
                  "AND `category` = ? " +
                  "ORDER BY `events`.`id` DESC " +
                  "LIMIT ?, ?;";

ALERTS_BY_MAC = "SELECT *, `alerts`.`id` AS row_id FROM `alerts` " +
                "JOIN (`nodes`) ON (`nodes`.`id`=`alerts`.`node_id`) " +
                "WHERE `mac` IN ? " +
                "ORDER BY `alerts`.`id` DESC " +
                "LIMIT ?, ?;";

DELETE_ALERTS_BY_ID = "DELETE FROM `alerts` " +
                      "WHERE `id` IN ? ;";

DELETE_ALERTS_BY_MAC = "DELETE `alerts` FROM `alerts` " +
                       "JOIN (`nodes`) ON (`nodes`.`id`=`alerts`.`node_id`) " +
                       "WHERE `mac` IN ? ;";

const DATA_FOLDER_PATH = './data/';

MAX_COLUMNS = 8;
var self = {
  keyIds: {},

  refreshKeyNames: function() {
    pool.getConnection(function(err, conn) {
      if (!conn) {
        console.error("Unable to get mysql connection");
        return;
      }
      let sqlQuery = "SELECT ts_key.id, nodes.mac, ts_key.key FROM ts_key " +
                     "JOIN (nodes) ON (nodes.id=ts_key.node_id)";
      conn.query(sqlQuery, function(err, results) {
        conn.release();
        if (err) {
          console.log('Error', err);
          return;
        }
        results.forEach(result => {
          self.keyIds[result.id] = {
            mac: result.mac,
            name: result.key
          };
        });
      });
    });
  },

  columnName: function (metricName) {
    if (metricName in self.keyIds) {
      let keyId = metricName;
      metricName = self.keyIds[keyId].mac;
    }
    switch (metricName) {
      case 'terra0.tx_bytes':
        return 'TX Bytes';
      case 'terra0.rx_bytes':
        return 'RX Bytes';
      case 'terra0.tx_errors':
        return 'TX Errors';
      case 'terra0.rx_errors':
        return 'RX Errors';
      case 'terra0.tx_dropped':
        return 'TX Dropped';
      case 'terra0.rx_dropped':
        return 'RX Dropped';
      case 'load-1':
        return '1-Minute Load Avg';
      case 'mem.util':
        return 'Memory Utilization';
      default:
        // remove periods
        return metricName;
//        return metricName.replace(/\./g, "");
    }
  },

  /*
   * Transform a result set into a list of points for pondjs
   * https://www.npmjs.com/package/react-timeseries-charts
   * const data = {
   *     name: "traffic",
   *     columns: ["time", "in", "out"],
   *     points: [
   *        [1400425947000, 52, 41],
   *        [1400425948000, 18, 45],
   *        [1400425949000, 26, 49],
   *        [1400425950000, 93, 81],
   *        ...
   *     ]
   * };
   */
  formatStats: function(result) {
    let dataPoints = [];
    result.forEach(row => {
      dataPoints.push([row.time * 1000, row.value]);
    });
    // drop the first and last data point since they're incomplete
    dataPoints.splice(0, 1);
    dataPoints.splice(-1, 1);
    const endpointResults = {
      name: "Traffic",
      columns: ["time", "value"],
      points: dataPoints,
    };
    return endpointResults;
  },

  // fetch metric names from DB
  fetchMetricNames: function(res, jsonPostData) {
    let postData = JSON.parse(jsonPostData);
    if (!postData ||
        !postData.topology ||
        !postData.topology.nodes ||
        !postData.topology.nodes.length) {
      return;
    }
    let nodeMacs = postData.topology.nodes.map(node => {
      return node.mac_addr;
    });
    // map name => node
    let nodesByName = {};
    postData.topology.nodes.forEach(node => {
      nodesByName[node.name] = node;
    });
    // fetch all keys for nodes in topology
    let sqlQuery = mysql.format(METRIC_NAMES, [[nodeMacs]]);
    pool.getConnection(function(err, conn) {
      if (!conn) {
        console.error("Unable to get mysql connection");
        res.status(500).end();
        return;
      }
      conn.query(sqlQuery, function(err, results) {
        conn.release();
        if (err) {
          console.log('Error', err);
          return;
        }
        let nodeMetrics = {};
        let siteMetrics = {};
        results.forEach(result => {
          // filter results
          if (result.key.endsWith("count.0") ||
              result.key.endsWith("count.600") ||
              result.key.endsWith("count.3600")) {
            return;
          }
          let mac = result.mac.toLowerCase();
          // map node => keys
          if (!(mac in nodeMetrics)) {
            nodeMetrics[mac] = {};
          }
          nodeMetrics[mac][result.key] = {
            dbKeyId: result.id
          };
        });
        // index by siteData['Site-A']['nodeName'] = [];
        postData.topology.nodes.forEach(node => {
          let mac = node.mac_addr.toLowerCase();
          if (mac in nodeMetrics) {
            let nodeData = nodeMetrics[mac];
            if (!(node.site_name in siteMetrics)) {
              siteMetrics[node.site_name] = {};
            }
            if (!(node.name in siteMetrics[node.site_name])) {
              siteMetrics[node.site_name][node.name] = [];
            }
            siteMetrics[node.site_name][node.name] = nodeData;
          }
        });
        // format all node + link stats
        // return list of key => name
        postData.topology.links.forEach(link => {
          // format the metric names
          let aNode = nodesByName[link.a_node_name];
          let zNode = nodesByName[link.z_node_name];
          METRIC_KEY_NAMES.forEach(metricName => {
            try {
              let {title, description, scale, keys} = 
                self.formatLinkKeyName(
                  metricName,
                  {name: aNode.name, mac: aNode.mac_addr},
                  {name: zNode.name, mac: zNode.mac_addr});
              keys.forEach(data => {
                let {node, keyName, titleAppend} = data;
                // find and tag the associated keys
                if (node.mac in nodeMetrics &&
                    keyName in nodeMetrics[node.mac]) {
                  let nodeData = nodeMetrics[node.mac][keyName];
                  // display name in the typeahead
                  nodeData['displayName'] = title;
                  nodeData['linkName'] = link.name;
                  // title when graphing
                  nodeData['title'] = titleAppend ? title + titleAppend : title;
                  nodeData['description'] = description;
                  nodeData['scale'] = scale;
                }
              });
            } catch (e) {
              console.error(e);
            }
          });
        });
        res.json({
          'site_metrics': siteMetrics,
        });
      });
    });
  },

  timePeriod: function(secondDiff) {
    if (secondDiff > (60 * 60)) {
      return self.round(secondDiff/60/60) + ' hours';
    } else if (secondDiff > 60) {
      return self.round(secondDiff/60) + ' minutes';
    } else {
      return secondDiff + ' seconds';
    }
  },

  round: function(value) {
    return Math.ceil(value * 100) / 100;
  },

  formatStatsGroup: function(result, groupBy, keyMapping = {}) {
    // use the data field to record the displayname
    let dataByKey = {}, keyNames, displayNames, linkNames;
    if (keyMapping && keyMapping.data) {
      keyMapping.data.forEach(data => {
        dataByKey[data.keyId] = data;
      });
      // check if key names are all the same, then show node names
      keyNames = new Set(keyMapping.data.map(data => data.key));
      displayNames = new Set(keyMapping.data.map(data => data.displayName));
      linkNames = new Set(keyMapping.data.map(data => data.linkName));
    }
    let columnNames = new Set();
    let dataPoints = [];
    // line up time => multiple points
    let timeSeriesGroup = {};
    result.forEach(row => {
      let keyName = row[groupBy];
      if (!(row.time in timeSeriesGroup)) {
        timeSeriesGroup[row.time] = {};
      }
      timeSeriesGroup[row.time][keyName] = row.value;
      // collect all unique key names
      columnNames.add(keyName);
    });
    let columnNamesArr = Array.from(columnNames);
    // trim large data
    if (columnNamesArr.length >= MAX_COLUMNS) {
      // pass through for max average value
      let sumValue = {};
      let dpCount = {};
      for (var tsKey in timeSeriesGroup) {
        for (var columnIdx in columnNamesArr) {
          let columnName = columnNamesArr[columnIdx];
          if (!(columnName in sumValue)) {
            sumValue[columnName] = 0;
            dpCount[columnName] = 0;
          }
          if (columnName in timeSeriesGroup[tsKey]) {
            sumValue[columnName] += timeSeriesGroup[tsKey][columnName];
            dpCount[columnName]++;
          }
        }
      }
      // sort to fetch the top N
      let topAvgValues = [];
      let avgValues = {};
      for (var columnName in sumValue) {
        let avg = sumValue[columnName] / dpCount[columnName];
        avgValues[columnName] = avg;
        topAvgValues.push(avg);
      }
      topAvgValues.sort();
      // finally, get the values above the threshold
      let thresholdValue = 0;
      if (topAvgValues.length > MAX_COLUMNS) {
        thresholdValue = topAvgValues[topAvgValues.length - 1 - MAX_COLUMNS];
      }
      columnNamesArr = columnNamesArr.filter(name => {
        return (avgValues[name] >= thresholdValue);
      });
      // and if multiple values match, just keep it below the threshold
      if (columnNamesArr.length > MAX_COLUMNS) {
        columnNamesArr.splice(MAX_COLUMNS);
      }
    }
    for (var key in timeSeriesGroup) {
      let values = timeSeriesGroup[key];
      let row = [key * 1000];
      for (var columnName in columnNamesArr) {
        row.push(values[columnNamesArr[columnName]] || 0);
      }
      dataPoints.push(row);
    }
    // determine if we should show the node or the key
    let columnDisplayNames = columnNamesArr.map(name => {
      if (name in dataByKey) {
        let data = dataByKey[name];
        if (data.linkName) {
          return data.linkName + ' / ' + data.title;
        } else if (data.displayName && displayNames.size > 1) {
          return data.displayName;
        } else if (keyNames.size > 1) {
          return data.key;
        } else if (data.nodeName) {
          return data.nodeName;
        } else {
          return data.node;
        }
      }
      return self.columnName(name);
    });

    columnDisplayNames = columnDisplayNames.map(name =>
      name.replace(/\./g, " "));
    // drop the first and last data point since they're incomplete
    dataPoints.splice(0, 1);
    dataPoints.splice(-1, 1);
    const endpointResults = {
      name: groupBy,
      columns: ["time"].concat(columnDisplayNames),
      points: dataPoints,
    };
    return endpointResults;
  },

  queryMulti: function(res, postDataJSON, type) {
    try {
      let postData = JSON.parse(postDataJSON);
      self.fetchMulti(res, postData, type);
    } catch (e) {
      console.error('Unable to parse JSON:', postDataJSON);
    }
  },

  formatLinkKeyName: function(metricName, aNode, zNode) {
    switch (metricName) {
      case 'rssi':
        return {
          title: 'RSSI',
          description: 'Received Signal Strength Indicator',
          scale: undefined,
          keys: [
            {
              node: aNode,
              keyName: 'tgf.' + zNode.mac + '.phystatus.srssi',
              titleAppend: ' (A)'
            },{
              node: zNode,
              keyName: 'tgf.' + aNode.mac + '.phystatus.srssi',
              titleAppend: ' (Z)'
            },
          ]
        };
      case 'alive_perc':
      case 'alive_snr':
      case 'snr':
        // tgf.00:00:00:10:0d:45.phystatus.ssnrEst
        return {
          title: 'SnR',
          description: 'Signal to Noise Ratio',
          scale: undefined,
          keys: [
            {
              node: aNode,
              keyName: 'tgf.' + zNode.mac + '.phystatus.ssnrEst',
              titleAppend: ' (A)'
            },{
              node: zNode,
              keyName: 'tgf.' + aNode.mac + '.phystatus.ssnrEst',
              titleAppend: ' (Z)'
            },
          ]
        };
        break;
      case 'mcs':
        // tgf.38:3a:21:b0:05:d1.staPkt.mcs
        return {
          title: 'MCS',
          description: 'MCS Index',
          scale: undefined,
          keys: [
            {
              node: aNode,
              keyName: 'tgf.' + zNode.mac + '.staPkt.mcs',
              titleAppend: ' (A)'
            },{
              node: zNode,
              keyName: 'tgf.' + aNode.mac + '.staPkt.mcs',
              titleAppend: ' (Z)'
            },
          ]
        };
      case 'per':
        // tgf.38:3a:21:b0:05:d1.staPkt.perE6
        return {
          title: 'PER',
          description: 'Packet Error Rate',
          scale: undefined,
          keys: [
            {
              node: aNode,
              keyName: 'tgf.' + zNode.mac + '.staPkt.perE6',
              titleAppend: ' (A)'
            },{
              node: zNode,
              keyName: 'tgf.' + aNode.mac + '.staPkt.perE6',
              titleAppend: ' (Z)'
            },
          ]
        };
      case 'rx_ok':
        return {
          title: 'RX Packets',
          description: 'Received packets',
          scale: undefined,
          keys: [
            {
              node: aNode,
              keyName: 'tgf.' + zNode.mac + '.staPkt.rxOk',
              titleAppend: ' (A)'
            },{
              node: zNode,
              keyName: 'tgf.' + aNode.mac + '.staPkt.rxOk',
              titleAppend: ' (Z)'
            },
          ]
        };
      case 'tx_ok':
        return {
          title: 'TX Packets',
          description: 'Transferred packets',
          scale: undefined,
          keys: [
            {
              node: aNode,
              keyName: 'tgf.' + zNode.mac + '.staPkt.txOk',
              titleAppend: ' (A)'
            },{
              node: zNode,
              keyName: 'tgf.' + aNode.mac + '.staPkt.txOk',
              titleAppend: ' (Z)'
            },
          ]
        };
      case 'tx_bytes':
        return {
          title: 'TX bps',
          description: 'Transferred bits/second',
          scale: undefined,
          keys: [
            {
              node: aNode,
              keyName: 'link.' + zNode.mac + '.tx_bytes',
              titleAppend: ' (A)'
            },{
              node: zNode,
              keyName: 'link.' + aNode.mac + '.tx_bytes',
              titleAppend: ' (Z)'
            },
          ]
        };
      case 'rx_bytes':
        return {
          title: 'RX bps',
          description: 'Received bits/second',
          scale: undefined,
          keys: [
            {
              node: aNode,
              keyName: 'link.' + zNode.mac + '.rx_bytes',
              titleAppend: ' (A)'
            },{
              node: zNode,
              keyName: 'link.' + aNode.mac + '.rx_bytes',
              titleAppend: ' (Z)'
            },
          ]
        };
      case 'tx_errors':
        return {
          title: 'TX errors',
          description: 'Transmit Errors/second',
          scale: undefined,
          keys: [
            {
              node: aNode,
              keyName: 'link.' + zNode.mac + '.tx_errors',
              titleAppend: ' (A)'
            },{
              node: zNode,
              keyName: 'link.' + aNode.mac + '.tx_errors',
              titleAppend: ' (Z)'
            },
          ]
        };
      case 'rx_errors':
        return {
          title: 'RX errors',
          description: 'Receive errors/second',
          scale: undefined,
          keys: [
            {
              node: aNode,
              keyName: 'link.' + zNode.mac + '.rx_errors',
              titleAppend: ' (A)'
            },{
              node: zNode,
              keyName: 'link.' + aNode.mac + '.rx_errors',
              titleAppend: ' (Z)'
            },
          ]
        };
      case 'tx_dropped':
        return {
          title: 'TX dropped',
          description: 'Transmit dropped/second',
          scale: undefined,
          keys: [
            {
              node: aNode,
              keyName: 'link.' + zNode.mac + '.tx_dropped',
              titleAppend: ' (A)'
            },{
              node: zNode,
              keyName: 'link.' + aNode.mac + '.tx_dropped',
              titleAppend: ' (Z)'
            },
          ]
        };
      case 'rx_dropped':
        return {
          title: 'RX dropped',
          description: 'Receive dropped/second',
          scale: undefined,
          keys: [
            {
              node: aNode,
              keyName: 'link.' + zNode.mac + '.rx_dropped',
              titleAppend: ' (A)'
            },{
              node: zNode,
              keyName: 'link.' + aNode.mac + '.rx_dropped',
              titleAppend: ' (Z)'
            },
          ]
        };
      case 'tx_pps':
        return {
          title: 'TX pps',
          description: 'Transmit packets/second',
          scale: undefined,
          keys: [
            {
              node: aNode,
              keyName: 'link.' + zNode.mac + '.tx_packets',
              titleAppend: ' (A)'
            },{
              node: zNode,
              keyName: 'link.' + aNode.mac + '.tx_packets',
              titleAppend: ' (Z)'
            },
          ]
        };
      case 'rx_pps':
        return {
          title: 'RX pps',
          description: 'Receive packets/second',
          scale: undefined,
          keys: [
            {
              node: aNode,
              keyName: 'link.' + zNode.mac + '.rx_packets',
              titleAppend: ' (A)'
            },{
              node: zNode,
              keyName: 'link.' + aNode.mac + '.rx_packets',
              titleAppend: ' (Z)'
            },
          ]
        };
      case 'tx_power':
        // tgf.38:3a:21:b0:05:d1.tpcStats.txPowerIndex
        return {
          title: 'TX Power',
          description: 'Transmit power',
          scale: undefined,
          keys: [
            {
              node: aNode,
              keyName: 'tgf.' + zNode.mac + '.tpcStats.txPowerIndex',
              titleAppend: ' (A)'
            },{
              node: zNode,
              keyName: 'tgf.' + aNode.mac + '.tpcStats.txPowerIndex',
              titleAppend: ' (Z)'
            },
          ]
        };
      case 'link_status':
        return {
          title: 'Link status',
          description: 'Link status reported by controller',
          scale: undefined,
          keys: [
            {
              /* This is reported by controller MAC (TODO) */
              node: aNode,
              keyName: 'e2e_controller.link_status.WIRELESS.' +
                aNode.mac + '.' + zNode.mac,
              titleAppend: ' (A)'
            },
          ]
        };
      default:
        throw "Undefined metric: " + metricName;
    }
  },

  makeListQuery: function(keyIds, minAgo) {
    let sqlQuery = mysql.format(MAC_AND_KEY, [[keyIds], minAgo]);
    return sqlQuery;
  },

  makeLinkQuery: function(aNode,
                          zNode,
                          metricNames,
                          query = LINK_METRIC) {
    let fields = [];
    // map metric short names to the fully qualified key
    let keyToMetric = {};
    let keyNames = metricNames.map(metricName => {
      let keyName = self.formatLinkKeyName(metricName, aNode, zNode).keys[0].keyName;
      // reverse map to the requested key
      keyToMetric[keyName] = metricName;
      return keyName;
    });
    // single key queries
    if (metricNames.length == 1) {
      let metricName = metricNames[0];
      switch (metricName) {
        case 'link_status':
          // the controller is the publisher, so we only need the
          // key (a mac.z mac) to identify.
          query = KEY_VALUES;
          fields = [
            keyNames,
          ];
          break;
        default:
          fields = [
            [[aNode.mac]],
            [keyNames],
          ];
      }
    } else {
      // determine the query
      fields = [
        [[aNode.mac]],
        [keyNames],
      ];
    }
    if (!query) {
      console.log('Query undefined for metric:', metricName);
      return;
    }
    let sqlQuery = mysql.format(query, fields);
    return sqlQuery;
  },

  makeTableQuery: function(res, topology) {
    // nodes by name
    let nodesByName = {};
    let nodesByMac = {};
    topology.nodes.forEach(node => {
      nodesByName[node.name] = {
        name: node.name,
        mac: node.mac_addr
      };
      nodesByMac[node.mac_addr.toLowerCase()] = node.name;
    });
    // calculate query
    let nodeMacs = [];
    let nodeKeys = [];
    topology.links.forEach(link => {
      // ignore wired links
      if (link.link_type != 1) {
        return;
      }
      let aNode = nodesByName[link.a_node_name];
      let zNode = nodesByName[link.z_node_name];
      // add nodes to request list
      nodeMacs.push(aNode.mac);
      let linkKeys = self.formatLinkKeyName('snr', aNode, zNode);
      nodeKeys.push(linkKeys.keys[0].keyName);
    });
    let aliveQuery = mysql.format(COUNT_ALIVE, [[nodeMacs], [nodeKeys]]);
    let snrQuery = mysql.format(COUNT_SNR_OK, [[nodeMacs], [nodeKeys]]);
    pool.getConnection(function(err, conn) {
      if (!conn) {
        console.error("Unable to get mysql connection");
        res.status(500).end();
        return;
      }
      let sqlQuery = conn.query([aliveQuery, snrQuery].join("; "), function(err, results) {
        conn.release();
        if (err) {
          console.log('Error', err);
          return;
        }
        let linkResults = {};
        for (let i = 0; i < results.length; i++) {
          results[i].forEach(row => {
            let nodeName = nodesByMac[row.mac.toLowerCase()];
            let remoteMac = row.key.substr("tgf.".length,
                                           17 /* mac address length */);
            let remoteNodeName = nodesByMac[remoteMac.toLowerCase()];
            if (!(nodeName in linkResults)) {
              linkResults[nodeName] = {};
            }
            if (!(remoteNodeName in linkResults[nodeName])) {
              linkResults[nodeName][remoteNodeName] = {};
            }
            let value = Math.ceil(row.total / 2880 * 10000) / 100;
            if (value > 100) {
              value = 100;
            }
            // grab the remote mac address from the key
            let metricName = i == 0 ? 'alive' : 'snr';
            linkResults[nodeName][remoteNodeName][metricName] = value;
          });
        }
        res.json({
          'nodes': {},
          'links': linkResults,
        });
      });
    });
  },

  makeNodeQuery: function(nodeMacs, metricName) {
    let query;
    let fields = [];
    switch (metricName) {
      case 'traffic_sum':
        // show an aggregate of traffic (TX + RX) for the whole network
        // next parameter should be a list of nodes
        query = SUM_BY_KEY;
        fields = [
          [nodeMacs],
          [['terra0.tx_bytes', 'terra0.rx_bytes']]
        ];
        break;
      case 'nodes_traffic_tx':
        // show traffic per host
        query = SUM_BY_MAC;
        fields = [
          [nodeMacs],
          [['terra0.tx_bytes']],
        ];
        break;
      case 'nodes_traffic_rx':
        query = SUM_BY_MAC;
        fields = [
          [nodeMacs],
          [['terra0.rx_bytes']],
        ];
        break;
      case 'errors_sum':
        query = SUM_BY_KEY;
        fields = [
          [nodeMacs],
          [['terra0.tx_errors', 'terra0.rx_errors']],
        ];
        break;
      case 'drops_sum':
        query = SUM_BY_KEY;
        fields = [
          [nodeMacs],
          [['terra0.tx_dropped', 'terra0.rx_dropped']],
        ];
        break;
      case 'mem_util':
        query = SUM_BY_MAC;
        fields = [
          [nodeMacs],
          [['mem.util']],
        ];
        break;
      case 'load-1':
      case 'load':
        query = SUM_BY_MAC;
        fields = [
          [nodeMacs],
          [['load-1']],
        ];
        break;
      case 'nodes_reporting':
        query = "SELECT UNIX_TIMESTAMP(`time`) AS time, " +
                  "COUNT(DISTINCT node_id) AS value FROM `ts_value` " +
                "JOIN (`ts_time`) ON (`ts_time`.`id`=`ts_value`.`time_id`) " +
                "JOIN (`ts_key`) ON (`ts_key`.`id`=`ts_value`.`key_id`) " +
                "JOIN (`nodes`) ON (`nodes`.`id`=`ts_key`.`node_id`) " +
                "WHERE `mac` IN ? " +
                "AND `key` = ? " +
                "AND `time` > DATE_SUB(NOW(), INTERVAL ? MINUTE) " +
                "GROUP BY `time` " +
                "ORDER BY `time` ASC";
        fields = [[nodeMacs], ['terra0.tx_bytes']];
        break;
      default:
        console.error('Undefined metric:', metricName);
    }
    if (!query) {
      console.log('Query undefined');
      return;
    }
    return mysql.format(query, fields);
  },

  fetchMulti: function(res, queries, resultType) {
    // execute query
    pool.getConnection(function(err, conn) {
      if (!conn) {
        console.error("Unable to get mysql connection");
        res.status(500).end();
        return;
      }
      // generate sql queries
      let sqlQueries = queries.map(query => {
        switch (query.type) {
          case 'node':
            let nodeMacs = query.nodes.map(node => {
              return node.mac_addr;
            });
            return self.makeNodeQuery(nodeMacs, query.key);
            break;
          case 'link':
            return self.makeLinkQuery(query.a_node, query.z_node, query.keys);
            break;
          case 'key_ids':
            // just accept a list of key ids
            return self.makeListQuery(query.key_ids, query.min_ago);
            break;
          default:
            console.error('Unknown query type:', query.type);
        }
      });
      let sqlQuery = conn.query(sqlQueries.join("; "), function(err, results) {
        conn.release();
        if (err) {
          console.log('Error', err);
          return;
        }
        let retResults = [];
        if (sqlQueries.length > 1) {
          for (let i = 0; i < results.length; i++) {
            retResults.push(self.processResults(results[i], queries[i], resultType));
          }
        } else {
          retResults.push(self.processResults(results, queries[0], resultType));
        }
        res.json(retResults);
      });
    });
  },

  fetchSysLogs: function(res, mac_addr, sourceFile, offset, size, date) {

    let folder = DATA_FOLDER_PATH + mac_addr + '/';
    let fileName = folder + date + '_' + sourceFile + ".log";

    fs.readFile(fileName, 'utf-8', function(err, data) {
        if (err) {
          res.json([]);
          return;
        }

        var lines = data.trim().split('\n');

        let numLines = lines.length;
        let begin = numLines - size - offset;
        if (begin < 0) begin = 0;

        let end = begin + size;
        if (end > numLines) end = numLines;

        var respLines = lines.slice(begin, end);
        res.json(respLines);
    });
  },

  fetchEventLogs: function(res, mac_addr, category, from, size) {
    // execute query
    pool.getConnection(function(err, conn) {
      if (!conn) {
        console.error("Unable to get mysql connection");
        res.status(500).end();
        return;
      }

      let fields = [[mac_addr], category, from, size];
      let sqlQuery = mysql.format(EVENTLOG_BY_MAC, fields);
      conn.query(sqlQuery, function(err, results) {
        conn.release();
        if (err) {
          console.log('Error', err);
          return;
        }
        let dataPoints = [];
        results.forEach(row => {
          dataPoints.push(row.sample);
        });
        res.json(dataPoints);
      });
    });
  },

  fetchAlerts: function(res, mac_addr, from, size) {
    // execute query
    pool.getConnection(function(err, conn) {
      if (!conn) {
        console.error("Unable to get mysql connection");
        res.status(500).end();
        return;
      }

      let fields = [[mac_addr], from, size];
      let sqlQuery = mysql.format(ALERTS_BY_MAC, fields);
      conn.query(sqlQuery, function(err, results) {
        conn.release();
        if (err) {
          console.log('Error', err);
          return;
        }
        let dataPoints = [];
        results.forEach(row => {
          dataPoints.push({
            id: row.row_id,
            mac: row.mac,
            timestamp: row.timestamp,
            alert_id: row.alert_id,
            alert_regex: row.alert_regex,
            alert_threshold: row.alert_threshold,
            alert_comparator: row.alert_comparator,
            alert_level: row.alert_level,
            trigger_key: row.trigger_key,
            trigger_value: row.trigger_value});
        });
        res.json(dataPoints);
      });
    });
  },

  deleteAlertsById: function(res, ids) {
    // execute query
    pool.getConnection(function(err, conn) {
      if (!conn) {
        console.error("Unable to get mysql connection");
        res.status(500).end();
        return;
      }

      let fields = [[ids]];
      let sqlQuery = mysql.format(DELETE_ALERTS_BY_ID, fields);
      conn.query(sqlQuery, function(err, results) {
        conn.release();
        if (err) {
          console.log('Error', err);
          return;
        }
      });
    });
  },

  deleteAlertsByMac: function(res, mac_addr) {
    // execute query
    pool.getConnection(function(err, conn) {
      if (!conn) {
        console.error("Unable to get mysql connection");
        res.status(500).end();
        return;
      }

      let fields = [[mac_addr]];
      let sqlQuery = mysql.format(DELETE_ALERTS_BY_MAC, fields);
      conn.query(sqlQuery, function(err, results) {
        conn.release();
        if (err) {
          console.log('Error', err);
          return;
        }
      });
    });
  },

  processResults: function(result, query, type) {
    switch (type) {
      case 'chart':
        switch (query.type) {
          case 'key_ids':
            return self.formatStatsGroup(result, 'id', query);
            break;
          case 'link':
            return self.formatStatsGroup(result, 'key', query);
            break;
          case 'node':
            switch (query.key) {
              case 'traffic_sum':
              case 'errors_sum':
              case 'drops_sum':
                return self.formatStatsGroup(result, 'key', query);
                break;
              case 'nodes_traffic_tx':
              case 'nodes_traffic_rx':
              case 'mem_util':
              case 'load-1':
              case 'load':
                return self.formatStatsGroup(result, 'mac', query);
                break;
              case 'nodes_reporting':
                return self.formatStats(result);
                break;
              default:
                // push raw json
                throw "Undefined key for node: " + query.key;
            }
            break;
          default:
            throw "Undefined query type: " + JSON.stringify(query);
        }
        break;
      case 'event':
        switch (query.type) {
          case 'link':
            let events = [];
            // break up the result into UP/DOWN intervals
            let lastValue;
            let lastTime;
            let lastTimeChanged;
            for (let i = 0; i < result.length; i++) {
              let row = result[i];
              let value = row.value;
              if (i == 0) {
                // record first value
                lastValue = row.value
                lastTime = row.time;
                lastTimeChanged = row.time;
              } else {
                let diff = row.time - lastTime;
                if (diff > 60) {
                  // if time diff over a minute, consider down
                  value = 0;
                }
                if (value && !lastValue) {
                  lastTimeChanged = row.time;
                } else if (!value && lastValue) {
                  let timeChangedDiff = row.time - lastTimeChanged;
                  events.push({
                    startTime: lastTimeChanged * 1000,
                    endTime: lastTime * 1000,
                    title: self.timePeriod(lastTime - lastTimeChanged),
                  });
                } else if (i == (result.length - 1) && value) {
                  // last event, publish if online
                  events.push({
                    startTime: lastTimeChanged * 1000,
                    endTime: row.time * 1000,
                    title: self.timePeriod(row.time - lastTimeChanged),
                  });
                }
                lastValue = value;
                lastTime = row.time;
              }
            }
            if (!events.length && result.length >= 2 && lastValue) {
              // sql data exists, but no change events found
              let startTime = result[0].time;
              let endTime = result[result.length - 1].time;
              events.push({
                startTime: startTime * 1000,
                endTime: endTime * 1000,
                title: self.timePeriod(endTime - startTime),
              });
            }
            return events;
            break;
          case 'node':
            break;
        }
      case 'raw':
        return result;
        break;
    }
  },
}

module.exports = self;
