/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict-local
 */

import type {TestExecution} from './TestExecution';

export type TestResult = {|
  id: number,
  status: number,
  origin_node: string,
  peer_node: string,
  link_name: string,
  start_date_utc: Date,
  end_date_utc: Date,
  pathloss_avg: number,
  foliage_factor: number,
  health: number,
  early_weak_factor: number,
  mcs_p90: number,
  mcs_avg: number,
  rssi_avg: number,
  rssi_std: number,
  snr_avg: number,
  snr_std: number,
  txpwr_avg: number,
  txpwr_std: number,
  num_tx_packets: number,
  num_rx_packets: number,
  tx_per: number,
  rx_per: number,
  tx_ba: number,
  rx_ba: number,
  tx_ppdu: number,
  rx_ppdu: number,
  rx_plcp_fail: number,
  rx_beam_idx: number,
  rx_rtcal_top_panel_beam: number,
  rx_rtcal_bot_panel_beam: number,
  rx_vbs_beam: number,
  rx_cbf_beam: number,
  tx_beam_idx: number,
  tx_rtcal_top_panel_beam: number,
  tx_rtcal_bot_panel_beam: number,
  tx_vbs_beam: number,
  tx_cbf_beam: number,
  link_up_time: number,
  link_available_time: number,
  num_link_up_flaps: number,
  num_link_avail_flaps: number,
  p2mp_flag: number,
  ping_avg_latency: number,
  ping_loss: number,
  ping_max_latency: number,
  ping_min_latency: number,
  ping_pkt_rx: number,
  ping_pkt_tx: number,
  iperf_throughput_min: number,
  iperf_throughput_max: number,
  iperf_throughput_mean: number,
  iperf_throughput_std: number,
  iperf_link_error_min: number,
  iperf_link_error_max: number,
  iperf_link_error_mean: number,
  iperf_link_error_std: number,
  iperf_jitter_min: number,
  iperf_jitter_max: number,
  iperf_jitter_mean: number,
  iperf_jitter_std: number,
  iperf_lost_datagram_min: number,
  iperf_lost_datagram_max: number,
  iperf_lost_datagram_mean: number,
  iperf_lost_datagram_std: number,
  iperf_udp_flag: number,
  iperf_p90_tput: number,
  test_run_execution_id: number,
  iperf_client_blob: string,
  iperf_server_blob: string,
  ping_output_blob: string,
  iperf_pushed_throughput: number,
  is_ecmp: number,
  route_changed_count: number,
  test_execution: ?TestExecution,
|};

export const TEST_STATUS = {
  RUNNING: 1,
  FINISHED: 2,
  ABORTED: 3,
  FAILED: 4,
  SCHEDULED: 5,
};
