// @flow

// Generated by thrift2flow at Mon Apr 08 2019 15:49:09 GMT-0700 (PDT)

import * as FwOptParams from './FwOptParams';
import * as BWAllocation from './BWAllocation';
import * as Topology from './Topology';

export type SystemParamsType = {|
  managedConfig: boolean,
  sshTrustedUserCAKeys: {[string]: string},
  dnsServers: {[string]: string},
  allowFactoryCA: boolean,
  ntpServers: {[string]: string},
  distributedIgnitionEnabled: boolean,
|};

export type NodeEnvParamsType = {|
  OPENR_ENABLED?: string,
  OPENR_ALLOC_PREFIX?: string,
  OPENR_USE_RTT_METRIC?: string,
  OPENR_USE_FIB_NSS?: string,
  OOB_NETNS?: string,
  OOB_INTERFACE?: string,
  CPE_INTERFACE?: string,
  E2E_ENABLED?: string,
  FW_IF2IF?: string,
  OPENR_DOMAIN?: string,
  FB_DRIVER_VERBOSE?: string,
  HMAC_VERBOSE?: string,
  KMOD_VERBOSE?: string,
  OPENR_STATIC_PREFIX_ALLOC?: string,
  OPENR_IFACE_PREFIXES?: string,
  MARVELL_SFP_SPEED?: string,
  MINION_VERBOSE?: string,
  STATS_AGENT_VERBOSE?: string,
  CPE_IFACE_IP_PREFIX?: string,
  BH_AMSDU_FRAME_FORMAT?: string,
  FB_PLATFORM_ENABLE_DPAA2?: string,
  TIMEZONE?: string,
  OPENR_LINK_FLAP_MAX_BACKOFF_MS?: string,
  UDP_PING_SERVER_ENABLED?: string,
  SSH_ENABLED?: string,
  OPENR_VERBOSE?: string,
|};

export type PopConfigParamsType = {|
  POP_ADDR?: string,
  POP_IFACE?: string,
  POP_STATIC_ROUTING?: string,
  POP_BGP_ROUTING?: string,
  GW_ADDR?: string
|};

export type EventFilterType = {| regex: string, level: string |};

export type LogTailSourceType = {|
  enabled: boolean,
  filename: string,
  eventFilters: { [string]: EventFilterType }
|};

export type LogTailParamsType = {| sources: { [string]: LogTailSourceType } |};

export type StatsAgentSourceType = {| enabled: boolean, zmq_url: string |};

export type StatsAgentParamsType = {|
  sources: { [string]: StatsAgentSourceType }
|};

export type OpenrLinkMetricConfigType = {
  enabled: boolean,
  metricMap: {[string]: number},
  tokenGenRate: number,
  tokenBurstSize: number,
  successiveChangeCount: number,
};

export type OpenrParamsType = {
  linkMetricConfig: OpenrLinkMetricConfigType,
};

export type OpenrLinkParamsType = {
  softDisable: boolean,
  fixedMetric: number,
};

export type LinkParamsType = {
  openrLinkParams: OpenrLinkParamsType,
  fwParams: FwOptParams.FwOptParamsType,
  airtimeConfig: ?BWAllocation.AirtimeConfigType,
};

export type RadioParams = {
  fwParams: FwOptParams.FwOptParamsType,
  wsecParams: WsecParams,
};

export type WsecParams = {
  hostapdVerbosity: number,
  supplicantVerbosity: number,
  eapolParams: EAPoLParams,
};

export type EAPoLParams = {
  radius_server_ip: string,
  radius_server_port: number,
  radius_user_identity: string,
  ca_cert_path: string,
  client_cert_path: string,
  private_key_path: string,
  secrets: {[string]: string},
};

export type DhcpParams = {
  dhcpGlobalConfigAppend: ?string,
  dhcpNameServer: string,
  dhcpRangeMax: number,
  dhcpRangeMin: number,
  dhcpInterface: string,
  dhcpPreferredLifetime: number,
  dhcpValidLifetime: number,
  dhcpRenewTimer: number,
  dhcpRebindTimer: number,
  dhcpPdPool: string,
  dhcpPdDelegatedLen: number,
  keaEnabled: boolean,
  optionData: ?{[string]: string},
  prefixSplitEnabled: boolean,
};

export type BgpParams = {
  localAsn: number,
  neighbors: {[string]: BgpNeighbor},
  keepalive: number,
  cpeNetworkPrefix: ?string,
  delegatedNetworkPrefixes: ?string,
  specificNetworkPrefixes: ?string,
  noPrefixCheck: ?boolean,
};

export type BgpNeighbor = {
  asn: number,
  ipv6: string,
  maximumPrefixes: ?number,
};

export type SyslogParams = {
  enabled: boolean,
  remoteHost: string,
  remotePort: number,
  protocol: string,
  selector: string,
};

export type FirewallChainConfig = {
  defaultTarget: string,
  tcpPorts: ?string,
  udpPorts: ?string,
  icmp6Types: ?string,
};

export type FirewallConfig = {
  allowEstablished: boolean,
  allowLoopback: boolean,
  inputCPE: ?FirewallChainConfig,
  inputPOP: ?FirewallChainConfig,
};

export type FluentdSource = {
  enabled: boolean,
  filename: string,
};

export type FluentdEndpoint = {
  host: string,
  port: number,
};

export type FluentdParams = {
  sources: {[string]: FluentdSource},
  endpoints: {[string]: FluentdEndpoint},
};
export type NeighborInfo = {
  initiatorMac: string,
  controlSuperframe: ?number,
  nodeType: ?Topology.NodeType,
  golayIdx: ?Topology.GolayIdxType,
  nodePolarity: ?Topology.PolarityTypeType,
};

export type RadioInfo = {
  distributedIgnitionColor: ?number,
};

export type TopologyInfo = {
  nodeName: string,
  topologyName: string,
  site: Topology.SiteType,
  nodeType: ?Topology.NodeType,
  neighborInfo: ?{[string]: NeighborInfo},
  radioInfo: {[string]: RadioInfo},
  distributedIgnitionNumColors: ?number,
};

export type NodeConfigType = {|
  dhcpParams: DhcpParams,
  envParams: NodeEnvParamsType,
  kvstoreParams?: {[string]: string},
  linkParamsBase: LinkParamsType,
  linkParamsOverride?: {[string]: LinkParamsType},
  logTailParams: LogTailParamsType,
  openrParams: ?OpenrParamsType,
  popParams: PopConfigParamsType,
  radioParamsBase: RadioParams,
  radioParamsOverride: {[string]: RadioParams},
  statsAgentParams: StatsAgentParamsType,
  sysParams: SystemParamsType,
  syslogParams: SyslogParams,
  fwParams: FwOptParams.NodeFwParamsType,
  bgpParams: BgpParams,
  firewallConfig: FirewallConfig,
  fluentdParams: FluentdParams,
  topologyInfo: TopologyInfo,
|};
