/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow strict-local
 */

export function mockUploadJson(): string {
  return '{"desc":"Version = Reporting Topology.","sites":{"193b8a64-5ca5-11ea-aca3-ec0d9a988932":{"site_id":"193b8a64-5ca5-11ea-aca3-ec0d9a988932","loc":{"latitude":37.340087,"longitude":-121.890662},"polarity":1,"site_type":3,"site_capex":1500,"site_opex":0,"site_lifetime":10,"status_type":3,"site_hash":"9m9i6j9br","breakdowns":15,"active_sectors":1,"times_on_mcs_route":13,"hops":0},"193b8f14-5ca5-11ea-89f1-ec0d9a988932":{"site_id":"193b8f14-5ca5-11ea-89f1-ec0d9a988932","loc":{"latitude":37.341304,"longitude":-121.891426},"polarity":4,"site_type":1,"site_capex":1500,"site_opex":0,"site_lifetime":10,"status_type":3,"site_hash":"9m9i6jb2f","breakdowns":0,"active_sectors":1,"times_on_mcs_route":4,"hops":0}},"nodes":{"7242ab9e-5ca5-11ea-a718-ec0d9a9807e6":{"node_id":"7242ab9e-5ca5-11ea-a718-ec0d9a9807e6","site_id":"193b8a64-5ca5-11ea-aca3-ec0d9a988932","ant_azimuth":338.7252334603193,"node_type":2,"status_type":3,"is_primary":true,"node_capex":250,"node_opex":0,"node_lifetime":10},"724caf5a-5ca5-11ea-ba9f-ec0d9a9807e6":{"node_id":"724caf5a-5ca5-11ea-ba9f-ec0d9a9807e6","site_id":"193b8f14-5ca5-11ea-89f1-ec0d9a988932","ant_azimuth":153.4904308893922,"node_type":1,"status_type":3,"is_primary":true,"node_capex":150,"node_opex":0,"node_lifetime":10}},"links":{"193c856e-5ca5-11ea-8a9e-ec0d9a988932":{"link_id":"193c856e-5ca5-11ea-8a9e-ec0d9a988932","tx_node_id":"7242ab9e-5ca5-11ea-a718-ec0d9a9807e6","rx_node_id":"724caf5a-5ca5-11ea-ba9f-ec0d9a9807e6","tx_beam_azimuth":333.49043088939214,"rx_beam_azimuth":153.4904308893922,"distance":151.21199189495724,"proposed_flow":1.7999999999999998,"tx_site_id":"193b8a64-5ca5-11ea-aca3-ec0d9a988932","rx_site_id":"193b8f14-5ca5-11ea-89f1-ec0d9a988932","status_type":3,"capacity":1.8,"altitudes":[0,0],"link_hash":"9m9i6j9br-9m9i6jb2f","MCS":12,"SNR":20.127070427200763,"RSL":-53.87292957279924,"balanced_utilization":99.99999999999999,"mcs_based_utilization":99.99999999999999,"p2mp":true,"breakdowns":1,"times_on_mcs_route":4,"SINR":20.127070427200763,"tx_dev":5.234802570927172,"rx_dev":0,"el_dev":0,"RSL_interference":-53.87292957279924}},"pop_capacity":10}';
}
