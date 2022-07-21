/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#include "UdpPinger.h"

#include <arpa/inet.h>
#include <linux/filter.h>
#include <pthread.h>
#include <sys/socket.h>
#include <unistd.h>

#include <chrono>
#include <cmath>
#include <future>
#include <thread>

#include <folly/Format.h>
#include <folly/GLog.h>
#include <folly/gen/Base.h>
#include <folly/gen/Core.h>
#include <folly/logging/Init.h>
#include <folly/logging/Logger.h>
#include <folly/system/ThreadName.h>

using folly::to;
using folly::gen::as;
using folly::gen::from;
using folly::gen::mapped;
using std::chrono::duration_cast;
using std::chrono::system_clock;

DEFINE_int32(bucket_min, 1e3, "Minimum RTT in us");
DEFINE_int32(bucket_max, 3e5, "Maximum RTT in us");
DEFINE_int32(bucket_size, 5e3, "Bucket size for histograms");

namespace {

using facebook::terragraph::stats::AsyncUdpSocket;

std::default_random_engine generator;
std::uniform_int_distribution<uint32_t> distribution(0, INT_MAX);

// Get a timestamp and store it in uint32_t object. Note that if the timestamp
// is larger than 32 bit, only the LSBs are recorded, since they are needed to
// calculate time differences.
template <class T>
inline uint32_t getTimestamp() {
  return duration_cast<T>(system_clock::now().time_since_epoch()).count();
}

void addToHistograms(
    const uint32_t rtt,
    const folly::IPAddress& address,
    const std::string& network,
    std::shared_ptr<std::unordered_map<
        folly::IPAddress,
        facebook::terragraph::stats::Histogram>> hostHistograms,
    std::shared_ptr<
        std::unordered_map<std::string, facebook::terragraph::stats::Histogram>>
        networkHistograms) {
  auto hostIt = hostHistograms->find(address);
  if (hostIt == hostHistograms->end()) {
    facebook::terragraph::stats::Histogram histogram(
        FLAGS_bucket_size, FLAGS_bucket_min, FLAGS_bucket_max);
    auto result = hostHistograms->emplace(address, std::move(histogram));
    hostIt = result.first;
  }
  hostIt->second.addValue(rtt);

  auto networkIt = networkHistograms->find(network);
  if (networkIt == networkHistograms->end()) {
    facebook::terragraph::stats::Histogram histogram(
        FLAGS_bucket_size, FLAGS_bucket_min, FLAGS_bucket_max);
    auto result = networkHistograms->emplace(network, std::move(histogram));
    networkIt = result.first;
  }
  networkIt->second.addValue(rtt);
}

// The following two methods are used for checksum computations
inline uint32_t uint16_checksum(uint16_t* data, size_t size) {
  uint32_t sum = 0;

  while (size >= 2) {
    sum += (uint32_t)ntohs(*data);
    data++;
    size -= 2;
  }

  if (size == 1) {
    sum += (uint32_t)ntohs(*(uint8_t*)data);
  }

  return sum;
}

uint16_t ipv6UdpCheckSum(
    uint16_t* data,
    uint16_t size,
    struct in6_addr* src,
    struct in6_addr* dst,
    uint8_t proto) {
  uint32_t phdr[2];
  uint32_t sum = 0;
  uint16_t sum2;

  sum += uint16_checksum((uint16_t*)(void*)src, 16);
  sum += uint16_checksum((uint16_t*)(void*)dst, 16);

  phdr[0] = htonl(size);
  phdr[1] = htonl(proto);

  sum += uint16_checksum((uint16_t*)phdr, 8);
  sum += uint16_checksum(data, size);

  sum = (sum & 0xFFFF) + (sum >> 16);
  sum = (sum & 0xFFFF) + (sum >> 16);
  sum2 = htons((uint16_t)sum);
  sum2 = ~sum2;

  if (sum2 == 0) {
    return 0xFFFF;
  }

  return sum2;
}

// Creates a raw IPv6 UDP socket for sending
int createRawSocket(int qos, int bufferSize) {
  int sock_fd;

  sock_fd = ::socket(AF_INET6, SOCK_RAW, IPPROTO_UDP);
  if (sock_fd < 0) {
    LOG(ERROR) << "Error creating raw IPv6 socket '" << folly::errnoStr(errno)
               << "'";
    return -1;
  }

  struct sockaddr_in6 addr;
  addr.sin6_family = AF_INET6;
  addr.sin6_addr = IN6ADDR_ANY_INIT;
  addr.sin6_flowinfo = 0;
  addr.sin6_port = 0;

  if (::bind(sock_fd, reinterpret_cast<struct sockaddr*>(&addr), sizeof(addr)) <
      0) {
    LOG(ERROR) << "Error binding IPv6 socket '" << folly::errnoStr(errno)
               << "'";
    ::close(sock_fd);
    return -1;
  }

  if (::setsockopt(sock_fd, IPPROTO_IPV6, IPV6_TCLASS, &qos, sizeof(qos)) < 0) {
    LOG(WARNING) << "Error setsockopt IPV6_TCLASS failed '"
                 << folly::errnoStr(errno) << "'";
  }

  // This is 'ret 0' BPF instruction - discard all packets
  struct sock_filter code[] = {
      {0x06, 0, 0, 0x00000000},
  };

  struct sock_fprog bpf = {
      .len = sizeof(code) / sizeof(code[0]),
      .filter = code,
  };

  if (::setsockopt(sock_fd, SOL_SOCKET, SO_ATTACH_FILTER, &bpf, sizeof(bpf)) <
      0) {
    LOG(WARNING) << "Cannot assign BPF filter to send socket";
  }

  if (bufferSize) {
    VLOG(3) << "Setting raw socket buffer to " << bufferSize;
    if (::setsockopt(
            sock_fd, SOL_SOCKET, SO_SNDBUF, &bufferSize, sizeof(bufferSize)) <
        0) {
      LOG(WARNING) << "Raw Socket: setsockopt SO_SNDBUF failed '"
                   << folly::errnoStr(errno) << "'";
    }

    int optval;
    socklen_t optlen;
    optlen = sizeof(optval);
    ::getsockopt(sock_fd, SOL_SOCKET, SO_SNDBUF, &optval, &optlen);

    VLOG(3) << "Raw socket: getsockopt SO_SNDBUF returned '" << optval << "'";
  }

  return sock_fd;
}

// Creates and binds UDP sockets for receiving, reports the local ports that
// could not be bound
std::pair<
    std::vector<std::shared_ptr<AsyncUdpSocket>>,
    std::set<int> /* missing ports */>
createUdpSockets(
    folly::EventBase* evb,
    int basePort,
    int portCount,
    int bufferSize,
    AsyncUdpSocket::ReadCallback* cob) {
  CHECK(evb) << "Event base can't be null";

  std::vector<std::shared_ptr<AsyncUdpSocket>> sockets;
  std::set<int> missingPorts;

  // Create N sockets and try binding them to successive ports. If this fails,
  // use a random port
  for (int i = 0; i < portCount; ++i) {
    sockets.emplace_back(std::make_shared<AsyncUdpSocket>(evb));
    auto& socket = sockets.back();
    socket->setReusePort(true);

    try {
      socket->bind(folly::SocketAddress("::", basePort + i));
    } catch (const folly::AsyncSocketException& e) {
      missingPorts.emplace(basePort + i);
      continue;
    }

    // Enable timestamping for this socket
    int enabled = 1;
    if (::setsockopt(
            socket->getFD(),
            SOL_SOCKET,
            SO_TIMESTAMPNS,
            &enabled,
            sizeof(enabled)) < 0) {
      LOG(ERROR) << "UdpWorker: setsockopt SO_TIMESTAMPNS failed '"
                 << folly::errnoStr(errno) << "'";
      missingPorts.emplace(basePort + i);
      continue;
    }

    if (bufferSize) {
      if (::setsockopt(
              socket->getFD(),
              SOL_SOCKET,
              SO_RCVBUF,
              &bufferSize,
              sizeof(bufferSize)) == -1) {
        LOG(WARNING) << "UdpWorker: setsockopt SO_RCVBUF failed '"
                     << folly::errnoStr(errno) << "'";
      }

      int optval;
      socklen_t optlen;
      optlen = sizeof(optval);
      ::getsockopt(socket->getFD(), SOL_SOCKET, SO_RCVBUF, &optval, &optlen);

      if (bufferSize != optval) {
        LOG(WARNING) << "Udp socket: getsockopt SO_RCVBUF returned '" << optval
                     << "'"
                     << " when requested " << bufferSize;
      }
    }

    if (cob) {
      socket->resumeRead(cob);
    }
  }

  return std::make_pair(sockets, missingPorts);
}

} // namespace

namespace facebook {
namespace terragraph {
namespace stats {

UdpSender::UdpSender(
    const thrift::PingerConfig& config,
    int qos,
    int senderId,
    int numSenders,
    uint32_t signature,
    folly::IPAddress srcIp,
    const std::set<int>& missingPorts,
    std::shared_ptr<folly::NotificationQueue<UdpTestPlan>> inputQueue)
    : config_(config),
      qos_(qos),
      senderId_(senderId),
      numSenders_(numSenders),
      signature_(signature),
      srcIp_(srcIp),
      missingPorts_(missingPorts),
      inputQueue_(std::move(inputQueue)) {}

void UdpSender::run() {
  socket_ = createRawSocket(qos_, config_.socket_buffer_size);
  if (socket_ == -1) {
    return;
  }

  // Drain the input queue
  prepareConsumer();
  CHECK(sendingConsumer_);
  sendingConsumer_->startConsuming(&evb_, inputQueue_.get());

  // Run the pinging loop
  evb_.loopForever();
  ::close(socket_);

  LOG(INFO) << "UdpSender " << senderId_ << " finished the run loop";
}

void UdpSender::buildAddressMap() {
  for (auto& testPlan : testPlans_) {
    // Target address to send to
    struct sockaddr_in6 addr;
    addr.sin6_family = AF_INET6;
    addr.sin6_port = 0;

    if (::inet_pton(
            AF_INET6, testPlan.target.ip.c_str(), &addr.sin6_addr.s6_addr) <
        0) {
      LOG(ERROR) << "Malformed IPv6 address " << testPlan.target.ip;
      return;
    }

    auto& mappedAddr = addressMap_[testPlan.target.ip];
    ::memcpy(&mappedAddr, &addr, sizeof(addr));
  }
}

void UdpSender::prepareConsumer() {
  sendingConsumer_ =
      folly::NotificationQueue<UdpTestPlan>::Consumer::make([this](
          UdpTestPlan && testPlan) noexcept {
        // Enqueue test plans until we receive the signal to start probing
        if (testPlan.numPackets != 0) {
          testPlans_.push_back(std::move(testPlan));
          return;
        }

        sendingConsumer_->stopConsuming();
        buildAddressMap();
        pingAllTargets();

        evb_.runAfterDelay(
            [this]() noexcept { evb_.terminateLoopSoon(); },
            config_.pinger_cooldown_time * 1000 /* in ms */
        );
      });
}

void UdpSender::pingAllTargets() {
  LOG(INFO) << "Worker " << senderId_ << " preparing to ping "
            << testPlans_.size() << " targets";

  // We add the full allowed range of source ports except for the ports that
  // receivers could not bind to
  std::vector<int> srcPorts;

  for (int port = config_.base_src_port;
       port < config_.base_src_port + config_.src_port_count;
       port++) {
    if (missingPorts_.find(port) != missingPorts_.end()) {
      continue;
    }
    srcPorts.push_back(port);
  }

  while (true) {
    bool done = true;
    auto start = std::chrono::high_resolution_clock::now();
    int packetsSent = 0;
    int sendFailed = 0;

    ProbeBody* probeBody;
    UdpHeader* udpHeader;

    // Update the counters inside each testPlan struct
    for (auto& testPlan : testPlans_) {
      if (!srcIp_.isLoopback() && srcPorts.size() &&
          (testPlan.packetsSent < testPlan.numPackets)) {
        done = false;

        // Target address to send to
        auto& addr = addressMap_[testPlan.target.ip];

        ::memset(&buf_[0], 0, sizeof(buf_));
        udpHeader = reinterpret_cast<UdpHeader*>(&buf_[0]);
        probeBody = reinterpret_cast<ProbeBody*>(&buf_[sizeof(UdpHeader)]);

        udpHeader->srcPort =
            htons(srcPorts[testPlan.packetsSent++ % srcPorts.size()]);
        udpHeader->dstPort = htons(config_.target_port);
        udpHeader->length = htons(sizeof(UdpHeader) + sizeof(ProbeBody));

        probeBody->signature = htonl(signature_);
        probeBody->pingerSentTime =
            htonl(getTimestamp<std::chrono::microseconds>());
        probeBody->tclass = qos_;

        struct in6_addr srcAddr =
            *reinterpret_cast<const struct in6_addr*>(srcIp_.bytes());

        udpHeader->checkSum = ipv6UdpCheckSum(
            reinterpret_cast<uint16_t*>(&buf_[0]),
            sizeof(buf_),
            &srcAddr,
            &((reinterpret_cast<struct sockaddr_in6*>(&addr))->sin6_addr),
            IPPROTO_UDP);

        if (::sendto(
                socket_,
                &buf_[0],
                sizeof(buf_),
                MSG_DONTWAIT,
                reinterpret_cast<struct sockaddr*>(&addr),
                sizeof(struct sockaddr_in6)) == -1) {
          // If we can try again, decrement the packet count so we can try
          // resending later
          if (errno == EAGAIN) {
            FB_LOG_EVERY_MS(INFO, 1000) << "EAGAIN in v6 sendto";
            --testPlan.packetsSent;
          } else {
            sendFailed++;
            FB_LOG_EVERY_MS(ERROR, 1000) << "UdpSender: v6 write error '"
                                         << folly::errnoStr(errno) << "'";
          }
        } else {
          packetsSent++;
        }
      }
    }

    auto finish = std::chrono::high_resolution_clock::now();

    if (sendFailed) {
      LOG(ERROR) << "Failed sending " << sendFailed << " out of "
                 << packetsSent + sendFailed << " packets";
    }

    if (done) {
      break;
    }

    auto elapsed = duration_cast<std::chrono::microseconds>(finish - start);
    auto delay = duration_cast<std::chrono::microseconds>(
        std::chrono::duration<double>(1.0 / config_.pinger_rate));

    FB_LOG_EVERY_MS(INFO, 1000) << "Ping sweep took: " << elapsed.count()
                                << " usec, sent " << packetsSent << " packets";

    // Wait to hit the desired pps goal
    if (delay > elapsed) {
      auto sleepTime = delay - elapsed;
      FB_LOG_EVERY_MS(INFO, 1000)
          << "Sleeping for " << sleepTime.count() << " usecs";
      /* sleep override */
      std::this_thread::sleep_for(sleepTime);
    }

  } // while

  LOG(INFO) << "Sender " << senderId_
            << " sent all probes, waiting for responses for "
            << config_.pinger_cooldown_time << " seconds";
}

void UdpReceiver::waitForSocketsToBind() {
  // Busy wait for variable to be set
  while (!socketsAreBound_) {
    std::this_thread::yield();
  }
}

UdpReceiver::UdpReceiver(
    const thrift::PingerConfig& config,
    uint32_t signature,
    int receiverId,
    std::vector<std::shared_ptr<folly::NotificationQueue<ReceiveProbe>>>
        recvQueues,
    const std::unordered_map<folly::IPAddress, thrift::Target>& ipToTargetMap)
    : config_(config),
      signature_(signature),
      receiverId_(receiverId),
      recvQueues_(recvQueues),
      ipToTargetMap_(ipToTargetMap),
      hostHistograms_(
          std::make_shared<std::unordered_map<folly::IPAddress, Histogram>>()),
      networkHistograms_(
          std::make_shared<std::unordered_map<std::string, Histogram>>()) {
  // Wipe out the message header first
  memset(&msg_, 0, sizeof(msg_));

  // We only expect to receive one block of data, single entry in the vector
  msg_.msg_iov = &entry_;
  msg_.msg_iovlen = 1;

  entry_.iov_base = readBuf_;
  entry_.iov_len = sizeof(readBuf_);

  // Control message buffer used to receive time-stamps from the kernel
  msg_.msg_control = ctrlBuf_;
  msg_.msg_controllen = sizeof(ctrlBuf_);

  // Prepare to receive IPv6 addresses
  ::memset(&addrStorage_, 0, sizeof(addrStorage_));
  msg_.msg_name = &addrStorage_;
  msg_.msg_namelen = sizeof(sockaddr_storage);
}

void UdpReceiver::run(int qos) {
  // These missing ports are not used in receiving thread. They are a byproduct
  // of the createUdpSockets function
  std::set<int> _missingPorts;

  // Create the sockets to be listening on
  tie(sockets_, _missingPorts) = createUdpSockets(
      &evb_,
      config_.base_src_port,
      config_.src_port_count,
      config_.socket_buffer_size,
      this /* cob */);

  socketsAreBound_ = true;

  receivingConsumer_ =
      folly::NotificationQueue<ReceiveProbe>::Consumer::make([this](
          ReceiveProbe && msg) noexcept {
        consumeMessage(std::forward<ReceiveProbe>(msg));
      });
  receivingConsumer_->startConsuming(&evb_, recvQueues_[receiverId_].get());

  // This will loop until stopped explicitly by an external caller
  evb_.loopForever();

  // Aggregate the stats that we have accumulated
  summarizeResults(qos);
}

void UdpReceiver::stop() {
  evb_.runInEventBaseThread([&] {
    closeSockets();
    receivingConsumer_->stopConsuming();
    evb_.terminateLoopSoon();
  });
}

const UdpTestResults& UdpReceiver::getResults() {
  return results_;
}

void UdpReceiver::summarizeResults(int qos) {
  LOG(INFO) << "UDP receiver starting result summarization";

  CHECK(!evb_.isRunning());

  uint32_t now = system_clock::to_time_t(system_clock::now());
  for (const auto& hostIt : *hostHistograms_) {
    auto result = std::make_shared<thrift::TestResult>();
    result->timestamp_s = now;
    result->metadata.tos = qos;

    try {
      const auto& target = ipToTargetMap_.at(hostIt.first);
      result->metadata.dst = target;
    } catch (const std::out_of_range& e) {
      // We received some packets that were not in the test plan
      VLOG(2) << "Received unexpected packet from " << hostIt.first;
      continue;
    }

    const auto& histogram = hostIt.second;
    result->metrics.num_recv = histogram.getTotalCount();

    // The result metrics are in ms
    result->metrics.rtt_avg = histogram.getAverage() / 1000;
    result->metrics.rtt_p75 =
        (double)histogram.getPercentileEstimate(0.75) / 1000;
    result->metrics.rtt_p90 =
        (double)histogram.getPercentileEstimate(0.9) / 1000;
    result->metrics.rtt_max = (double)histogram.getMaxSample() / 1000;
    results_.hostResults.push_back(std::move(result));
  }
  hostHistograms_->clear();

  for (const auto& networkIt : *networkHistograms_) {
    auto result = std::make_shared<thrift::TestResult>();
    result->timestamp_s = now;
    result->metadata.tos = qos;
    result->metadata.dst.network = networkIt.first;

    const auto& histogram = networkIt.second;
    result->metrics.num_recv = histogram.getTotalCount();

    // The result metrics are in ms
    result->metrics.rtt_avg = histogram.getAverage() / 1000;
    result->metrics.rtt_p75 =
        (double)histogram.getPercentileEstimate(0.75) / 1000;
    result->metrics.rtt_p90 =
        (double)histogram.getPercentileEstimate(0.9) / 1000;
    result->metrics.rtt_max = (double)histogram.getMaxSample() / 1000;
    results_.networkResults.push_back(std::move(result));
  }
  networkHistograms_->clear();

  LOG(INFO) << "Receiver done summarizing results";

  LOG(INFO) << "Built partial results host size " << results_.hostResults.size()
            << " and network size " << results_.networkResults.size();
}

void UdpReceiver::consumeMessage(ReceiveProbe&& message) noexcept {
  const auto rtt = message.rtt;
  auto address = message.remoteAddress.getIPAddress();
  auto targetIt = ipToTargetMap_.find(address);

  if (targetIt != ipToTargetMap_.end()) {
    addToHistograms(
        rtt,
        address,
        targetIt->second.network,
        hostHistograms_,
        networkHistograms_);
  } else {
    FB_LOG_EVERY_MS(ERROR, 100)
        << "Received unexpected packet from " << address;
  }
}

void UdpReceiver::closeSockets() {
  for (auto& socket : sockets_) {
    socket->pauseRead();
    socket->close();
  }
  sockets_.clear();
}

void UdpReceiver::getMessageHeader(struct msghdr** msg) noexcept {
  ::memset(&addrStorage_, 0, sizeof(addrStorage_));
  msg_.msg_namelen = sizeof(sockaddr_storage);
  *msg = &msg_;
}

void UdpReceiver::onMessageAvailable(size_t len) noexcept {
  uint32_t now = getTimestamp<std::chrono::microseconds>();

  folly::SocketAddress addr;
  addr.setFromSockaddr(
      reinterpret_cast<sockaddr*>(&addrStorage_), sizeof(addrStorage_));

  if (msg_.msg_flags & MSG_TRUNC) {
    LOG(ERROR) << "UdpReadCallback: Dropping truncated data packet from "
               << addr;
    return;
  }

  if (len < kProbeDataLen) {
    LOG(ERROR) << "UdpReadCallback: Received malformed packet";
    return;
  }

  // Get the kernel timestamp
  struct cmsghdr* cmsg;
  struct timespec* stamp{nullptr};

  for (cmsg = CMSG_FIRSTHDR(&msg_); cmsg; cmsg = CMSG_NXTHDR(&msg_, cmsg)) {
    switch (cmsg->cmsg_level) {
      case SOL_SOCKET:
        switch (cmsg->cmsg_type) {
          case SO_TIMESTAMPNS: {
            stamp = (struct timespec*)CMSG_DATA(cmsg);
            break;
          }
        }
    }
  }

  // Set recvTs to "now" if kernel timestamp is not supported
  uint32_t recvTs = now;
  if (stamp) {
    // The kernel receive timestamp
    recvTs = stamp->tv_nsec / 1000 + stamp->tv_sec * 1000000;
  }

  ReceiveProbe probe;
  probe.remoteAddress = addr;
  ProbeBody probeBody;
  ::memcpy(&probeBody, readBuf_, sizeof(probeBody));

  auto signature = ntohl(probeBody.signature);
  if (signature != signature_) {
    // Received a bogus packet
    LOG(ERROR) << "Signature mismatched in packet from " << addr;
    return;
  }

  // Calculate the adjustment on receive side (Only used for logging)
  uint32_t adjPinger = now - recvTs;

  // How much to adjust RTT based on target-collected timestamps. We use this
  // data to compensate for wait time in the target process
  uint32_t adjTarget =
      (ntohl(probeBody.targetRespTime) - ntohl(probeBody.targetRcvdTime));

  probe.rtt = recvTs - ntohl(probeBody.pingerSentTime) - adjTarget;

  // Log the RTT adjustments
  FB_LOG_EVERY_MS(INFO, 1000) << folly::sformat(
      "Measured RTT {} usec for addr {}, adjustement by pinger {}, adjustment "
      "by target {}",
      probe.rtt,
      addr.describe(),
      adjPinger,
      adjTarget);

  std::string networkName;
  try {
    networkName = ipToTargetMap_.at(addr.getIPAddress()).network;
  } catch (const std::out_of_range& e) {
    FB_LOG_EVERY_MS(ERROR, 500)
        << "Response from unknown IP address " << addr.getIPAddress();
    return;
  }

  auto it = networkNameToQueueId_.find(networkName);
  int queueId;
  if (it == networkNameToQueueId_.end()) {
    queueId = hasher_(networkName) % recvQueues_.size();
    networkNameToQueueId_.emplace(std::move(networkName), queueId);
  } else {
    queueId = it->second;
  }

  // Bypass NotificationQueue, since this is for ourselves
  if (queueId == receiverId_) {
    consumeMessage(std::move(probe));
  } else {
    auto result = recvQueues_[queueId]->tryPutMessageNoThrow(std::move(probe));
    if (!result) {
      LOG(ERROR) << "Failed to enqueue packet from " << addr;
    }
  }
}

UdpPinger::UdpPinger(const thrift::PingerConfig& config, folly::IPAddress srcIp)
    : config_(config), srcIp_(srcIp) {}

UdpTestResults UdpPinger::run(
    const std::vector<UdpTestPlan>& testPlans,
    int qos) const {
  auto numSenders = (int)config_.num_sender_threads;
  auto numReceivers = (int)config_.num_receiver_threads;

  LOG(INFO) << "UdpPinger for QoS " << qos << " and pps " << config_.pinger_rate
            << " starting with " << numSenders << " senders and "
            << numReceivers << " receivers";

  // Signature value to use for this pinger run
  uint32_t signature = distribution(generator);

  // Pre-bind the UDP sockets to find any "blocked" source ports. EventBase only
  // needed to create the sockets
  folly::EventBase _evb;
  std::vector<std::shared_ptr<AsyncUdpSocket>> _sockets;
  std::set<int> missingPorts;

  tie(_sockets, missingPorts) = createUdpSockets(
      &_evb,
      config_.base_src_port,
      config_.src_port_count,
      config_.socket_buffer_size,
      nullptr /* cob */);

  if (missingPorts.size()) {
    LOG(WARNING) << "Could not bind UDP ports "
                 << folly::sformat(folly::join(
                        ", ",
                        from(missingPorts) | mapped([](int port) {
                          return to<std::string>(port);
                        }) | as<std::vector>()));
  }

  // Create the sender queues
  std::vector<std::future<void>> sendFutures;
  std::vector<std::shared_ptr<folly::NotificationQueue<UdpTestPlan>>>
      sendingQueues;
  std::vector<std::thread> senderThreads;

  for (int i = 0; i < numSenders; ++i) {
    sendingQueues.emplace_back(
        std::make_shared<folly::NotificationQueue<UdpTestPlan>>());
    auto sender = std::make_shared<UdpSender>(
        config_,
        qos,
        i /* senderId */,
        numSenders,
        signature,
        srcIp_,
        missingPorts,
        sendingQueues[i]);
    senderThreads.emplace_back(std::thread([sender, i] {
      folly::setThreadName(folly::sformat("UdpPinger-Sender-{}", i));
      sender->run();
    }));
  }

  // Create mapping tables used by the receivers
  std::unordered_map<folly::IPAddress, thrift::Target> ipToTargetMap;

  for (const auto& testPlan : testPlans) {
    try {
      folly::IPAddress ip(testPlan.target.ip);
      ipToTargetMap.emplace(std::move(ip), testPlan.target);
    } catch (const folly::IPAddressFormatException& e) {
      LOG(ERROR) << testPlan.target.ip << " isn't an IP address";
    }
  }

  // Create the receiver queues. This is where UdpReceivers will dump their
  // results
  std::vector<std::shared_ptr<folly::NotificationQueue<ReceiveProbe>>>
      recvQueues;

  // Create all queues together since every receiver needs to know them all
  for (int i = 0; i < numReceivers; ++i) {
    recvQueues.emplace_back(
        std::make_shared<folly::NotificationQueue<ReceiveProbe>>());
  }

  // Start the receivers
  std::vector<std::thread> recvThreads;
  std::vector<std::shared_ptr<UdpReceiver>> receivers;
  for (int i = 0; i < numReceivers; ++i) {
    receivers.emplace_back(std::make_shared<UdpReceiver>(
        config_, signature, i /* receiverId */, recvQueues, ipToTargetMap));
    recvThreads.emplace_back(std::thread([i, receivers, qos] {
      folly::setThreadName(folly::sformat("UdpPinger-Receiver-{}", i));
      receivers[i]->run(qos);
    }));

    receivers[i]->waitForSocketsToBind();
  }

  // Now we can close the sockets since all receivers have been created, and
  // all sockets have been bound
  for (auto& socket : _sockets) {
    socket->close();
  }

  // Probes we send (and expect to receive) per host
  std::unordered_map<std::string, int> hostProbeCount;
  // Probes we send (and expect to receive) per network
  std::unordered_map<std::string, int> networkProbeCount;

  std::unordered_map<std::string, thrift::Target> hostToTargetMap;
  for (const auto& testPlan : testPlans) {
    // Save host results using custom ID because node names are not necessarily
    // globally unique
    const auto id = testPlan.target.name + "\0" + testPlan.target.network;
    hostProbeCount.emplace(id, testPlan.numPackets);
    networkProbeCount[testPlan.target.network] += testPlan.numPackets;
    hostToTargetMap.emplace(id, testPlan.target);
  }

  // Submit test plans to senders
  std::hash<std::string> hasher;
  for (const auto& testPlan : testPlans) {
    auto queueId = hasher(testPlan.target.site) % numSenders;
    auto result =
        sendingQueues[queueId]->tryPutMessageNoThrow(std::move(testPlan));
    if (!result) {
      LOG(ERROR) << "Cannot enqueue test plan";
    }
  }

  for (auto& queue : sendingQueues) {
    // In-band stop signal
    UdpTestPlan dummyPlan;
    dummyPlan.numPackets = 0;
    queue->tryPutMessageNoThrow(dummyPlan);
  }

  LOG(INFO) << "Finished dispatching all plans";

  // Wait for the sender threads to finish
  for (auto& thread : senderThreads) {
    thread.join();
  }

  // Tell the receiver threads to stop
  LOG(INFO) << "Telling all receivers to stop...";
  for (int i = 0; i < numReceivers; ++i) {
    receivers[i]->stop();
    recvThreads[i].join();
  }

  // Combine results from all receivers
  LOG(INFO) << "All receivers have stopped...";
  UdpTestResults results;

  for (auto& receiver : receivers) {
    auto& partialResults = receiver->getResults();
    LOG(INFO) << "Got partial results host size "
              << partialResults.hostResults.size() << " network size "
              << partialResults.networkResults.size();

    results.hostResults.insert(
        results.hostResults.end(),
        partialResults.hostResults.begin(),
        partialResults.hostResults.end());

    results.networkResults.insert(
        results.networkResults.end(),
        partialResults.networkResults.begin(),
        partialResults.networkResults.end());
  }

  for (auto& result : results.hostResults) {
    // Retrieve host results using custom ID because node names are not necessarily
    // globally unique
    const auto id = result->metadata.dst.name + "\0" + result->metadata.dst.network;
    result->metrics.num_xmit = hostProbeCount.at(id);
    hostProbeCount.erase(id);

    result->metrics.loss_ratio =
        1 - (double)result->metrics.num_recv / result->metrics.num_xmit;
  }

  for (auto& result : results.networkResults) {
    result->metrics.num_xmit =
        networkProbeCount.at(result->metadata.dst.network);
    networkProbeCount.erase(result->metadata.dst.network);

    result->metrics.loss_ratio =
        1 - (double)result->metrics.num_recv / result->metrics.num_xmit;
  }

  // Output empty results
  uint32_t now = system_clock::to_time_t(system_clock::now());

  // hostProbeCount now only contains the records for the hosts that never
  // responded at all. As the hosts which didn't respond do not have a result,
  // they would not be submitted to hostResults (raw). Iterate over the non
  // responders now in order to create results for them
  for (const auto& hostProbeIt : hostProbeCount) {
    auto result = std::make_shared<thrift::TestResult>();
    result->timestamp_s = now;
    result->metrics.num_xmit = hostProbeIt.second;
    result->metrics.loss_ratio = 1;
    const auto& target = hostToTargetMap[hostProbeIt.first];
    result->metadata.dst = target;
    result->metadata.tos = qos;
    result->metadata.dead = true;

    VLOG(2) << "Tagged host '" << result->metadata.dst.name << "' as dead";
    results.hostResults.push_back(std::move(result));
  }

  // networkProbeCount now only contains the records for networks that never
  // responded at all. Iterate over them to create results.
  for (const auto& networkProbeIt : networkProbeCount) {
    auto result = std::make_shared<thrift::TestResult>();
    result->timestamp_s = now;
    result->metrics.num_xmit = networkProbeIt.second;
    result->metrics.loss_ratio = 1;
    result->metadata.dst.network = networkProbeIt.first;

    VLOG(2) << "Tagged network '" << networkProbeIt.first << "' as offline";
    results.networkResults.push_back(std::move(result));
  }

  return results;
}

} // namespace stats
} // namespace terragraph
} // namespace facebook
