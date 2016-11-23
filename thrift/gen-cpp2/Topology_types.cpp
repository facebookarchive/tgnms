/**
 * Autogenerated by Thrift
 *
 * DO NOT EDIT UNLESS YOU ARE SURE THAT YOU KNOW WHAT YOU ARE DOING
 *  @generated
 */
#include "Topology_types.h"

#include "Topology_types.tcc"


#include <algorithm>

namespace facebook { namespace terragraph { namespace thrift {

const typename apache::thrift::detail::TEnumMapFactory<NodeType, NodeType>::ValuesToNamesMapType _NodeType_VALUES_TO_NAMES = apache::thrift::detail::TEnumMapFactory<NodeType, NodeType>::makeValuesToNamesMap();
const typename apache::thrift::detail::TEnumMapFactory<NodeType, NodeType>::NamesToValuesMapType _NodeType_NAMES_TO_VALUES = apache::thrift::detail::TEnumMapFactory<NodeType, NodeType>::makeNamesToValuesMap();

}}} // facebook::terragraph::thrift
namespace std {

} // std
namespace apache { namespace thrift {

template <> folly::Range<const std::pair< ::facebook::terragraph::thrift::NodeType, folly::StringPiece>*> TEnumTraitsBase< ::facebook::terragraph::thrift::NodeType>::enumerators() {
  static constexpr const std::pair< ::facebook::terragraph::thrift::NodeType, folly::StringPiece> storage[3] = {
    { ::facebook::terragraph::thrift::NodeType::CN, "CN"},
    { ::facebook::terragraph::thrift::NodeType::DN, "DN"},
    { ::facebook::terragraph::thrift::NodeType::POP, "POP"},
  };
  return folly::range(storage);
}

template <> const char* TEnumTraitsBase< ::facebook::terragraph::thrift::NodeType>::findName( ::facebook::terragraph::thrift::NodeType value) {
  return findName( ::facebook::terragraph::thrift::_NodeType_VALUES_TO_NAMES, value);
}

template <> bool TEnumTraitsBase< ::facebook::terragraph::thrift::NodeType>::findValue(const char* name,  ::facebook::terragraph::thrift::NodeType* outValue) {
  return findValue( ::facebook::terragraph::thrift::_NodeType_NAMES_TO_VALUES, name, outValue);
}

}} // apache::thrift
namespace facebook { namespace terragraph { namespace thrift {

const typename apache::thrift::detail::TEnumMapFactory<PolarityType, PolarityType>::ValuesToNamesMapType _PolarityType_VALUES_TO_NAMES = apache::thrift::detail::TEnumMapFactory<PolarityType, PolarityType>::makeValuesToNamesMap();
const typename apache::thrift::detail::TEnumMapFactory<PolarityType, PolarityType>::NamesToValuesMapType _PolarityType_NAMES_TO_VALUES = apache::thrift::detail::TEnumMapFactory<PolarityType, PolarityType>::makeNamesToValuesMap();

}}} // facebook::terragraph::thrift
namespace std {

} // std
namespace apache { namespace thrift {

template <> folly::Range<const std::pair< ::facebook::terragraph::thrift::PolarityType, folly::StringPiece>*> TEnumTraitsBase< ::facebook::terragraph::thrift::PolarityType>::enumerators() {
  static constexpr const std::pair< ::facebook::terragraph::thrift::PolarityType, folly::StringPiece> storage[2] = {
    { ::facebook::terragraph::thrift::PolarityType::ODD, "ODD"},
    { ::facebook::terragraph::thrift::PolarityType::EVEN, "EVEN"},
  };
  return folly::range(storage);
}

template <> const char* TEnumTraitsBase< ::facebook::terragraph::thrift::PolarityType>::findName( ::facebook::terragraph::thrift::PolarityType value) {
  return findName( ::facebook::terragraph::thrift::_PolarityType_VALUES_TO_NAMES, value);
}

template <> bool TEnumTraitsBase< ::facebook::terragraph::thrift::PolarityType>::findValue(const char* name,  ::facebook::terragraph::thrift::PolarityType* outValue) {
  return findValue( ::facebook::terragraph::thrift::_PolarityType_NAMES_TO_VALUES, name, outValue);
}

}} // apache::thrift
namespace facebook { namespace terragraph { namespace thrift {

const typename apache::thrift::detail::TEnumMapFactory<LinkType, LinkType>::ValuesToNamesMapType _LinkType_VALUES_TO_NAMES = apache::thrift::detail::TEnumMapFactory<LinkType, LinkType>::makeValuesToNamesMap();
const typename apache::thrift::detail::TEnumMapFactory<LinkType, LinkType>::NamesToValuesMapType _LinkType_NAMES_TO_VALUES = apache::thrift::detail::TEnumMapFactory<LinkType, LinkType>::makeNamesToValuesMap();

}}} // facebook::terragraph::thrift
namespace std {

} // std
namespace apache { namespace thrift {

template <> folly::Range<const std::pair< ::facebook::terragraph::thrift::LinkType, folly::StringPiece>*> TEnumTraitsBase< ::facebook::terragraph::thrift::LinkType>::enumerators() {
  static constexpr const std::pair< ::facebook::terragraph::thrift::LinkType, folly::StringPiece> storage[2] = {
    { ::facebook::terragraph::thrift::LinkType::WIRELESS, "WIRELESS"},
    { ::facebook::terragraph::thrift::LinkType::ETHERNET, "ETHERNET"},
  };
  return folly::range(storage);
}

template <> const char* TEnumTraitsBase< ::facebook::terragraph::thrift::LinkType>::findName( ::facebook::terragraph::thrift::LinkType value) {
  return findName( ::facebook::terragraph::thrift::_LinkType_VALUES_TO_NAMES, value);
}

template <> bool TEnumTraitsBase< ::facebook::terragraph::thrift::LinkType>::findValue(const char* name,  ::facebook::terragraph::thrift::LinkType* outValue) {
  return findValue( ::facebook::terragraph::thrift::_LinkType_NAMES_TO_VALUES, name, outValue);
}

}} // apache::thrift
namespace facebook { namespace terragraph { namespace thrift {

void Site::__clear() {
  name = std::string();
  latitude = 0;
  longitude = 0;
  altitude = 0;
  __isset.__clear();
}

bool Site::operator==(const Site& rhs) const {
  if (!((name == rhs.name))) {
    return false;
  }
  if (!((latitude == rhs.latitude))) {
    return false;
  }
  if (!((longitude == rhs.longitude))) {
    return false;
  }
  if (!((altitude == rhs.altitude))) {
    return false;
  }
  return true;
}

void swap(Site& a, Site& b) {
  using ::std::swap;
  swap(a.name, b.name);
  swap(a.latitude, b.latitude);
  swap(a.longitude, b.longitude);
  swap(a.altitude, b.altitude);
  swap(a.__isset, b.__isset);
}

template uint32_t Site::read<>(apache::thrift::BinaryProtocolReader*);
template uint32_t Site::write<>(apache::thrift::BinaryProtocolWriter*) const;
template uint32_t Site::serializedSize<>(apache::thrift::BinaryProtocolWriter const*) const;
template uint32_t Site::serializedSizeZC<>(apache::thrift::BinaryProtocolWriter const*) const;
template uint32_t Site::read<>(apache::thrift::CompactProtocolReader*);
template uint32_t Site::write<>(apache::thrift::CompactProtocolWriter*) const;
template uint32_t Site::serializedSize<>(apache::thrift::CompactProtocolWriter const*) const;
template uint32_t Site::serializedSizeZC<>(apache::thrift::CompactProtocolWriter const*) const;

}}} // facebook::terragraph::thrift
namespace apache { namespace thrift {

}} // apache::thrift
namespace facebook { namespace terragraph { namespace thrift {

void Node::__clear() {
  name = std::string();
  node_type =  ::facebook::terragraph::thrift::NodeType();
  is_primary = 0;
  mac_addr = std::string();
  pop_node = 0;
  is_ignited = 0;
  polarity =  ::facebook::terragraph::thrift::PolarityType();
  site_name = std::string();
  ant_azimuth = 0;
  ant_elevation = 0;
  __isset.__clear();
}

bool Node::operator==(const Node& rhs) const {
  if (!((name == rhs.name))) {
    return false;
  }
  if (!((node_type == rhs.node_type))) {
    return false;
  }
  if (__isset.is_primary != rhs.__isset.is_primary) {
    return false;
  }
  else if (__isset.is_primary && !((is_primary == rhs.is_primary))) {
    return false;
  }
  if (!((mac_addr == rhs.mac_addr))) {
    return false;
  }
  if (!((pop_node == rhs.pop_node))) {
    return false;
  }
  if (__isset.is_ignited != rhs.__isset.is_ignited) {
    return false;
  }
  else if (__isset.is_ignited && !((is_ignited == rhs.is_ignited))) {
    return false;
  }
  if (__isset.polarity != rhs.__isset.polarity) {
    return false;
  }
  else if (__isset.polarity && !((polarity == rhs.polarity))) {
    return false;
  }
  if (__isset.site_name != rhs.__isset.site_name) {
    return false;
  }
  else if (__isset.site_name && !((site_name == rhs.site_name))) {
    return false;
  }
  if (__isset.ant_azimuth != rhs.__isset.ant_azimuth) {
    return false;
  }
  else if (__isset.ant_azimuth && !((ant_azimuth == rhs.ant_azimuth))) {
    return false;
  }
  if (__isset.ant_elevation != rhs.__isset.ant_elevation) {
    return false;
  }
  else if (__isset.ant_elevation && !((ant_elevation == rhs.ant_elevation))) {
    return false;
  }
  return true;
}

void swap(Node& a, Node& b) {
  using ::std::swap;
  swap(a.name, b.name);
  swap(a.node_type, b.node_type);
  swap(a.is_primary, b.is_primary);
  swap(a.mac_addr, b.mac_addr);
  swap(a.pop_node, b.pop_node);
  swap(a.is_ignited, b.is_ignited);
  swap(a.polarity, b.polarity);
  swap(a.site_name, b.site_name);
  swap(a.ant_azimuth, b.ant_azimuth);
  swap(a.ant_elevation, b.ant_elevation);
  swap(a.__isset, b.__isset);
}

template uint32_t Node::read<>(apache::thrift::BinaryProtocolReader*);
template uint32_t Node::write<>(apache::thrift::BinaryProtocolWriter*) const;
template uint32_t Node::serializedSize<>(apache::thrift::BinaryProtocolWriter const*) const;
template uint32_t Node::serializedSizeZC<>(apache::thrift::BinaryProtocolWriter const*) const;
template uint32_t Node::read<>(apache::thrift::CompactProtocolReader*);
template uint32_t Node::write<>(apache::thrift::CompactProtocolWriter*) const;
template uint32_t Node::serializedSize<>(apache::thrift::CompactProtocolWriter const*) const;
template uint32_t Node::serializedSizeZC<>(apache::thrift::CompactProtocolWriter const*) const;

}}} // facebook::terragraph::thrift
namespace apache { namespace thrift {

}} // apache::thrift
namespace facebook { namespace terragraph { namespace thrift {

void Link::__clear() {
  name = std::string();
  a_node_name = std::string();
  z_node_name = std::string();
  link_type =  ::facebook::terragraph::thrift::LinkType();
  is_alive = 0;
  linkup_attempts = 0;
  __isset.__clear();
}

bool Link::operator==(const Link& rhs) const {
  if (!((name == rhs.name))) {
    return false;
  }
  if (!((a_node_name == rhs.a_node_name))) {
    return false;
  }
  if (!((z_node_name == rhs.z_node_name))) {
    return false;
  }
  if (!((link_type == rhs.link_type))) {
    return false;
  }
  if (__isset.is_alive != rhs.__isset.is_alive) {
    return false;
  }
  else if (__isset.is_alive && !((is_alive == rhs.is_alive))) {
    return false;
  }
  if (__isset.linkup_attempts != rhs.__isset.linkup_attempts) {
    return false;
  }
  else if (__isset.linkup_attempts && !((linkup_attempts == rhs.linkup_attempts))) {
    return false;
  }
  return true;
}

void swap(Link& a, Link& b) {
  using ::std::swap;
  swap(a.name, b.name);
  swap(a.a_node_name, b.a_node_name);
  swap(a.z_node_name, b.z_node_name);
  swap(a.link_type, b.link_type);
  swap(a.is_alive, b.is_alive);
  swap(a.linkup_attempts, b.linkup_attempts);
  swap(a.__isset, b.__isset);
}

template uint32_t Link::read<>(apache::thrift::BinaryProtocolReader*);
template uint32_t Link::write<>(apache::thrift::BinaryProtocolWriter*) const;
template uint32_t Link::serializedSize<>(apache::thrift::BinaryProtocolWriter const*) const;
template uint32_t Link::serializedSizeZC<>(apache::thrift::BinaryProtocolWriter const*) const;
template uint32_t Link::read<>(apache::thrift::CompactProtocolReader*);
template uint32_t Link::write<>(apache::thrift::CompactProtocolWriter*) const;
template uint32_t Link::serializedSize<>(apache::thrift::CompactProtocolWriter const*) const;
template uint32_t Link::serializedSizeZC<>(apache::thrift::CompactProtocolWriter const*) const;

}}} // facebook::terragraph::thrift
namespace apache { namespace thrift {

}} // apache::thrift
namespace facebook { namespace terragraph { namespace thrift {

void Topology::__clear() {
  name = std::string();
  nodes.clear();
  links.clear();
  sites.clear();
  __isset.__clear();
}

bool Topology::operator==(const Topology& rhs) const {
  if (!((name == rhs.name))) {
    return false;
  }
  if (!((nodes == rhs.nodes))) {
    return false;
  }
  if (!((links == rhs.links))) {
    return false;
  }
  if (!((sites == rhs.sites))) {
    return false;
  }
  return true;
}

const std::vector< ::facebook::terragraph::thrift::Node>& Topology::get_nodes() const& {
  return nodes;
}

std::vector< ::facebook::terragraph::thrift::Node> Topology::get_nodes() && {
  return std::move(nodes);
}

const std::vector< ::facebook::terragraph::thrift::Link>& Topology::get_links() const& {
  return links;
}

std::vector< ::facebook::terragraph::thrift::Link> Topology::get_links() && {
  return std::move(links);
}

const std::vector< ::facebook::terragraph::thrift::Site>& Topology::get_sites() const& {
  return sites;
}

std::vector< ::facebook::terragraph::thrift::Site> Topology::get_sites() && {
  return std::move(sites);
}

void swap(Topology& a, Topology& b) {
  using ::std::swap;
  swap(a.name, b.name);
  swap(a.nodes, b.nodes);
  swap(a.links, b.links);
  swap(a.sites, b.sites);
  swap(a.__isset, b.__isset);
}

template uint32_t Topology::read<>(apache::thrift::BinaryProtocolReader*);
template uint32_t Topology::write<>(apache::thrift::BinaryProtocolWriter*) const;
template uint32_t Topology::serializedSize<>(apache::thrift::BinaryProtocolWriter const*) const;
template uint32_t Topology::serializedSizeZC<>(apache::thrift::BinaryProtocolWriter const*) const;
template uint32_t Topology::read<>(apache::thrift::CompactProtocolReader*);
template uint32_t Topology::write<>(apache::thrift::CompactProtocolWriter*) const;
template uint32_t Topology::serializedSize<>(apache::thrift::CompactProtocolWriter const*) const;
template uint32_t Topology::serializedSizeZC<>(apache::thrift::CompactProtocolWriter const*) const;

}}} // facebook::terragraph::thrift
namespace apache { namespace thrift {

}} // apache::thrift
namespace facebook { namespace terragraph { namespace thrift {

}}} // facebook::terragraph::thrift
