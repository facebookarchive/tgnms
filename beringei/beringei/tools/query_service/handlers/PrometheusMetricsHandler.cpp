/**
 * Copyright (c) 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#include "PrometheusMetricsHandler.h"
#include "../PrometheusUtils.h"

#include <utility>

#include <folly/DynamicConverter.h>
#include <folly/io/IOBuf.h>
#include <proxygen/httpserver/ResponseBuilder.h>
#include <thrift/lib/cpp/util/ThriftSerializer.h>
#include <thrift/lib/cpp2/protocol/Serializer.h>

using apache::thrift::SimpleJSONSerializer;
using std::chrono::duration_cast;
using std::chrono::milliseconds;
using std::chrono::system_clock;
using namespace proxygen;

namespace facebook {
namespace gorilla {

PrometheusMetricsHandler::PrometheusMetricsHandler(const int metricInterval)
    : metricInterval_(metricInterval) {}

void PrometheusMetricsHandler::onRequest(
    std::unique_ptr<HTTPMessage> /* unused */) noexcept {
  // nothing to do
}

void PrometheusMetricsHandler::onBody(
    std::unique_ptr<folly::IOBuf> body) noexcept {
  if (body_) {
    body_->prependChain(move(body));
  } else {
    body_ = move(body);
  }
}

void PrometheusMetricsHandler::onEOM() noexcept {
  auto prometheusInstance = PrometheusUtils::getInstance();
  // grab all metrics
  std::vector<std::string> metrics =
      prometheusInstance->pollMetrics(metricInterval_);
  std::string response = folly::join("\n", metrics) + "\n";
  ResponseBuilder(downstream_)
      .status(200, "OK")
      .header("Content-Type", "text/plain")
      .body(response)
      .sendWithEOM();
}

void PrometheusMetricsHandler::onUpgrade(
    UpgradeProtocol /* unused */) noexcept {}

void PrometheusMetricsHandler::requestComplete() noexcept {
  delete this;
}

void PrometheusMetricsHandler::onError(ProxygenError /* unused */) noexcept {
  LOG(ERROR) << "Proxygen reported error";
  // In QueryServiceFactory, we created this handler using new.
  // Proxygen does not delete the handler.
  delete this;
}

} // namespace gorilla
} // namespace facebook
