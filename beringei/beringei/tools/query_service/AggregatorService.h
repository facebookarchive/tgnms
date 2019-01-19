/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#pragma once

#include "RuckusController.h"
#include "StatsTypeAheadCache.h"

#include <folly/Synchronized.h>
#include <folly/io/async/EventBaseManager.h>

#include "beringei/client/BeringeiClient.h"
#include "beringei/if/gen-cpp2/beringei_query_types_custom_protocol.h"
#include "beringei/if/gen-cpp2/Topology_types_custom_protocol.h"

namespace facebook {
namespace gorilla {

class AggregatorService {
 public:
  explicit AggregatorService(TACacheMap& typeaheadCache);
  // loop eventbase
  void start();

 private:
  folly::EventBase eb_;
  std::unique_ptr<folly::AsyncTimeout> timer_{nullptr};
  // from queryservicefactory
  TACacheMap& typeaheadCache_;


  // schedule timer in a loop for periodic work
  void timerCb();
  // perform all periodic work
  void doPeriodicWork();
  // query and log topology based metrics (nodes & links online)
  void fetchAndLogTopologyMetrics(
      std::unordered_map<std::string /* key name */,
                         std::pair<time_t, double>>& aggValues,
      const query::Topology& topology);
  // create datapoints from metrics
  void createDataPoints(
      std::vector<DataPoint>& bDataPoints,
      const std::unordered_map<std::string /* key name */,
                               std::pair<time_t, double>>& aggValues,
      std::shared_ptr<query::TopologyConfig> topologyConfig);
  // store metrics in beringei backend
  void storeAggregateMetrics(std::vector<DataPoint>& bDataPoints);
};
} // namespace gorilla
} // namespace facebook
