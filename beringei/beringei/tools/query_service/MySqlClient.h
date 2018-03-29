/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#pragma once

#include <folly/Memory.h>
#include <folly/dynamic.h>
#include <folly/futures/Future.h>

#include "beringei/if/gen-cpp2/Topology_types_custom_protocol.h"
#include "beringei/if/gen-cpp2/beringei_query_types_custom_protocol.h"
#include "beringei/if/gen-cpp2/scans_types_custom_protocol.h"
#include "mysql_connection.h"
#include "mysql_driver.h"

#include <cppconn/driver.h>
#include <cppconn/exception.h>
#include <cppconn/prepared_statement.h>
#include <cppconn/resultset.h>
#include <cppconn/statement.h>

namespace facebook {
namespace gorilla {

typedef std::unordered_map<std::string, std::shared_ptr<query::MySqlNodeData>>
    MacToNodeMap;
typedef std::unordered_map<std::string, std::shared_ptr<query::MySqlNodeData>>
    NameToNodeMap;
typedef std::unordered_map<int64_t, std::unordered_map<std::string, int64_t>>
    NodeKeyMap;
typedef std::unordered_map<int64_t, std::unordered_map<std::string, int64_t>>
    NodeCategoryMap;

class MySqlClient {
 public:
  MySqlClient();

  void refreshAll() noexcept;

  std::vector<std::shared_ptr<query::MySqlNodeData>> getNodes();

  std::vector<std::shared_ptr<query::MySqlNodeData>> getNodesWithKeys();

  std::vector<std::shared_ptr<query::MySqlNodeData>> getNodes(
      const std::unordered_set<std::string>& nodeMacs);

  std::vector<std::shared_ptr<query::MySqlNodeData>> getNodesWithKeys(
      const std::unordered_set<std::string>& nodeMacs);

  std::map<int64_t, std::shared_ptr<query::TopologyConfig>>
  getTopologyConfigs();

  void addAggKeys(
      const int64_t topologyId,
      const std::vector<std::string>& keyNames) noexcept;

  void refreshAggregateKeys(
      std::map<int64_t, std::shared_ptr<query::TopologyConfig>>&
          topologyIdMap) noexcept;

  void refreshNodes() noexcept;

  void refreshTopologies() noexcept;

  void refreshStatKeys() noexcept;

  void addOrUpdateNodes(
      const std::unordered_map<std::string, query::MySqlNodeData>&
          newNodes) noexcept;

  void addStatKeys(
      const std::unordered_map<int64_t, std::unordered_set<std::string>>&
          nodeKeys) noexcept;

  folly::Optional<int64_t> getNodeId(const std::string& macAddr) const;
  folly::Optional<int64_t> getNodeIdFromNodeName(
      const std::string& macAddr) const;

  folly::Optional<int64_t> getKeyId(
      const int64_t nodeId,
      const std::string& keyName) const;

  bool writeScanResponses(
      const std::vector<scans::MySqlScanResp>& mySqlScanResponses) noexcept;
  int64_t refreshScanResponse(std::string& network) noexcept;

 private:
  enum mySqlErrorCode { MYSQL_NO_ERROR=0, MYSQL_DUPLICATE_ENTRY=1062 };
  sql::Driver* driver_;
  std::unique_ptr<sql::Connection> connection_;
  std::vector<std::shared_ptr<query::MySqlNodeData>> nodes_{};
  std::map<int64_t, std::shared_ptr<query::TopologyConfig>> topologyIdMap_{};
  MacToNodeMap macAddrToNode_{};
  NameToNodeMap nodeNameToNodeId_{};
  std::unordered_map<int64_t, std::shared_ptr<query::MySqlNodeData>>
      nodeIdToNode_{};
  NodeKeyMap nodeKeyIds_{};
  NodeCategoryMap nodeCategoryIds_{};
  bool writeRxScanResponse(
      const scans::MySqlScanRxResp& scanResponse,
      const int64_t txId) noexcept;
  int writeTxScanResponse(const scans::MySqlScanTxResp& scanResponse) noexcept;
  int64_t getLastId(
      const int token,
      const int64_t startBwgd,
      const std::string& network) noexcept;

};
} // namespace gorilla
} // namespace facebook
