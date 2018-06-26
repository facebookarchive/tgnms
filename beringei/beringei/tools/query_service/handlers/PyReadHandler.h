/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#pragma once

#include "../StatsTypeAheadCache.h"

#include <folly/Memory.h>
#include <folly/dynamic.h>
#include <folly/futures/Future.h>
#include <proxygen/httpserver/RequestHandler.h>

#include "beringei/client/BeringeiClient.h"
#include "beringei/client/BeringeiConfigurationAdapterIf.h"
#include "beringei/if/gen-cpp2/Topology_types_custom_protocol.h"
#include "beringei/if/gen-cpp2/beringei_query_types_custom_protocol.h"

namespace facebook {
namespace gorilla {

// PyReadHandler will handle raw data read request and
// return queryed results from Beringei DB.
// The incoming request is serialzed bytes (RawReadQueryRequest)
// in the incoming http msg body.
// The query return is serialzed bytes (RawTimeSeriesList) in the
// http msg return body.
class PyReadHandler : public proxygen::RequestHandler {
 public:
  explicit PyReadHandler(TACacheMap& typeaheadCache);

  void onRequest(
      std::unique_ptr<proxygen::HTTPMessage> headers) noexcept override;

  void onBody(std::unique_ptr<folly::IOBuf> body) noexcept override;

  void onEOM() noexcept override;

  void onUpgrade(proxygen::UpgradeProtocol proto) noexcept override;

  void requestComplete() noexcept override;

  void onError(proxygen::ProxygenError err) noexcept override;

 private:
  bool receivedBody_;
  std::unique_ptr<folly::IOBuf> body_;
  TACacheMap& typeaheadCache_;
};
} // namespace gorilla
} // namespace facebook
