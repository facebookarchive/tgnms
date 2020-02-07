// @flow strict-local

// Generated by thrift2flow at Thu Feb 21 2019 13:01:24 GMT-0800 (PST)
/* eslint-disable */

import * as Monitor from "./Monitor";

export type AggrMessageTypeType =
  | "GET_STATUS_DUMP"
  | "STATUS_DUMP"
  | "GET_ALERTS_CONFIG"
  | "GET_ALERTS_CONFIG_RESP"
  | "SET_ALERTS_CONFIG"
  | "SET_ALERTS_CONFIG_RESP"
  | "STATS_REPORT"
  | "HIGH_FREQUENCY_STATS_REPORT"
  | "SYSLOG_REPORT"
  | "PING"
  | "PONG"
  | "GET_AGGR_CONFIG_REQ"
  | "GET_AGGR_CONFIG_RESP"
  | "SET_AGGR_CONFIG_REQ"
  | "GET_AGGR_CONFIG_METADATA_REQ"
  | "GET_AGGR_CONFIG_METADATA_RESP"
  | "AGGR_ACK"
  | "GET_TOPOLOGY"
  | "TOPOLOGY";
export const AggrMessageTypeValueMap = {
  GET_STATUS_DUMP: 101,
  STATUS_DUMP: 201,
  GET_ALERTS_CONFIG: 501,
  GET_ALERTS_CONFIG_RESP: 502,
  SET_ALERTS_CONFIG: 503,
  SET_ALERTS_CONFIG_RESP: 504,
  STATS_REPORT: 402,
  HIGH_FREQUENCY_STATS_REPORT: 403,
  SYSLOG_REPORT: 451,
  PING: 301,
  PONG: 302,
  GET_AGGR_CONFIG_REQ: 601,
  GET_AGGR_CONFIG_RESP: 602,
  SET_AGGR_CONFIG_REQ: 603,
  GET_AGGR_CONFIG_METADATA_REQ: 604,
  GET_AGGR_CONFIG_METADATA_RESP: 605,
  AGGR_ACK: 1001,
  GET_TOPOLOGY: 1002,
  TOPOLOGY: 1003
};

export type AggrGetStatusDumpType = {||};

export type AggrStatusDumpType = {| version?: string |};

export type AggrStatType = {|
  key: string,
  timestamp: Buffer,
  value: number,
  isCounter: boolean
|};

export type AggrStatsReportType = {|
  stats: AggrStatType[],
  events: Monitor.EventLogType[]
|};

export type AggrAlertComparatorType =
  | "ALERT_GT"
  | "ALERT_GTE"
  | "ALERT_LT"
  | "ALERT_LTE";
export const AggrAlertComparatorValueMap = {
  ALERT_GT: 0,
  ALERT_GTE: 1,
  ALERT_LT: 2,
  ALERT_LTE: 3
};

export type AggrAlertLevelType =
  | "ALERT_INFO"
  | "ALERT_WARNING"
  | "ALERT_CRITICAL";
export const AggrAlertLevelValueMap = {
  ALERT_INFO: 0,
  ALERT_WARNING: 1,
  ALERT_CRITICAL: 2
};

export type AggrAlertConfType = {|
  id: string,
  key: string,
  threshold: number,
  comp: AggrAlertComparatorType,
  level: AggrAlertLevelType,
  nodeMac?: string
|};

export type AggrAlertConfListType = {| alerts: AggrAlertConfType[] |};

export type AggrSetAlertsConfigRespType = {| success: boolean |};

export type AggrSyslogType = {|
  timestamp: Buffer,
  index: string,
  log: string
|};

export type AggrSyslogReportType = {|
  macAddr: string,
  syslogs: AggrSyslogType[]
|};

export type AggrGetTopologyType = {||};

export type AggrPingType = {| clientTs: Buffer |};

export type AggrPongType = {| clientTs: Buffer |};

export type AggregatorConfigType = {|
  flags: { [string]: string },
  dataEndpoints: {[string]: AggrDataEndpoint},
|};

export type AggrDataEndpoint = {
  host: string,
  statsWriterSuffix: string,
  logsWriterSuffix: string,
  highFreqStatsWriterSuffix: string,
  eventsWriterSuffix: string,
  statsEnabled: boolean,
  eventsEnabled: boolean,
  logsEnabled: boolean,
  highFreqStatsEnabled: boolean,
};

export type AggrGetConfigReqType = {||};

export type AggrGetConfigRespType = {| config: string |};

export type AggrSetConfigReqType = {| config: string |};

export type AggrGetConfigMetadataType = {||};

export type AggrGetConfigMetadataRespType = {| metadata: string |};

export type AggrMessageType = {|
  mType: AggrMessageTypeType,
  value: Buffer,
  compressed?: boolean,
  compressionFormat?: AggrCompressionFormatType
|};

export type AggrCompressionFormatType = "SNAPPY";
export const AggrCompressionFormatValueMap = {
  SNAPPY: 1
};

export type AggrAckType = {| success: boolean, message: string |};
