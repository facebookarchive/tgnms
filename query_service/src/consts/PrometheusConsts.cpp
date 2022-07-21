/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "PrometheusConsts.h"

namespace facebook {
namespace terragraph {
namespace stats {

// node labels
const std::string PrometheusConsts::LABEL_NODE_MAC{"nodeMac"};
const std::string PrometheusConsts::LABEL_NODE_NAME{"nodeName"};
const std::string PrometheusConsts::LABEL_NODE_IS_POP{"pop"};
const std::string PrometheusConsts::LABEL_NODE_IS_CN{"cn"};
const std::string PrometheusConsts::LABEL_RADIO_MAC{"radioMac"};
// site labels
const std::string PrometheusConsts::LABEL_SITE_NAME{"siteName"};
// link labels
const std::string PrometheusConsts::LABEL_LINK_NAME{"linkName"};
const std::string PrometheusConsts::LABEL_LINK_DIRECTION{"linkDirection"};
// network labels
const std::string PrometheusConsts::LABEL_NETWORK{"network"};
// data interval
const std::string PrometheusConsts::LABEL_DATA_INTERVAL{"intervalSec"};
// metric format
const std::string PrometheusConsts::METRIC_FORMAT{"{}=\"{}\""};

} // namespace stats
} // namespace terragraph
} // namespace facebook
