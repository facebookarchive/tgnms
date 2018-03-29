/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#pragma once

#include "ApiServiceClient.h"
#include "MySqlClient.h"
#include "StatsTypeAheadCache.h"

#include "beringei/if/gen-cpp2/Topology_types_custom_protocol.h"
#include "beringei/if/gen-cpp2/beringei_query_types_custom_protocol.h"

#include <folly/Synchronized.h>
#include <folly/io/async/EventBaseManager.h>

namespace facebook {
namespace gorilla {

class TopologyFetcher {
 public:
  explicit TopologyFetcher(
      std::shared_ptr<MySqlClient> mySqlClient,
      TACacheMap& typeaheadCache,
      std::shared_ptr<ApiServiceClient> apiServiceClient);

  // run eventbase
  void start();
  void timerCb();
  // requests topology from an api_service endpoint
  void updateTypeaheadCache(query::Topology& topology);

 private:
  folly::EventBase eb_;
  std::shared_ptr<MySqlClient> mySqlClient_;
  std::shared_ptr<ApiServiceClient> apiServiceClient_;
  TACacheMap& typeaheadCache_;
  std::unique_ptr<folly::AsyncTimeout> timer_{nullptr};
  std::unique_ptr<folly::AsyncTimeout> ruckusTimer_{nullptr};
  void updateDbNodesTable(query::Topology& topology);
};
} // namespace gorilla
} // namespace facebook
