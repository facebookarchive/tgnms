import React from 'react';
import { render } from 'react-dom';
import { Actions } from '../../constants/NetworkConstants.js';
import Dispatcher from '../../NetworkDispatcher.js';
import { availabilityColor, polarityColor } from '../../NetworkHelper.js';
import swal from 'sweetalert';
import 'sweetalert/dist/sweetalert.css';

export default class DetailsTopology extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    // average availability of all links across site
    let alivePercAvg = 0;
    let linksWithData = 0;
    let wirelessLinksCount = 0;
    Object.keys(this.props.links).forEach(linkName => {
      let link = this.props.links[linkName];
      if (link.link_type != 1) {
        // only wireless links
        return;
      }
      // skip links where mac is not defined on both sides
      if (!this.props.nodes.hasOwnProperty(link.a_node_name) ||
          !this.props.nodes.hasOwnProperty(link.z_node_name)) {
        return;
      }
      let nodeA = this.props.nodes[link.a_node_name];
      let nodeZ = this.props.nodes[link.z_node_name];
      if (nodeA.mac_addr == null || nodeZ.mac_addr == null ||
          !nodeA.mac_addr.length || !nodeZ.mac_addr.length) {
        return;
      }
      let alivePerc = 0;
      if (link.hasOwnProperty("alive_perc")) {
        alivePerc = parseInt(link.alive_perc * 1000) / 1000.0;
        linksWithData++;
      }
      wirelessLinksCount++;
      alivePercAvg += alivePerc;
    });
    let nodeTypes = {};
    let polarities = {};
    // { site name, polarity }
    let polarityBySite = {};
    this.props.topology.nodes.forEach(node => {
      // calculate # of dns, cns
      if (!nodeTypes.hasOwnProperty(node.node_type)) {
        nodeTypes[node.node_type] = 0;
      }
      nodeTypes[node.node_type]++;
      // polarities
      let nodePolarity = node.polarity;
      // replace undefined polarities
      if (nodePolarity == undefined || nodePolarity == null) {
        nodePolarity = 0;
      }
      if (!polarities.hasOwnProperty(nodePolarity)) {
        polarities[nodePolarity] = 0;
      }
      polarities[nodePolarity]++;
      // polarity by site
      if (!polarityBySite.hasOwnProperty(node.site_name)) {
        polarityBySite[node.site_name] = nodePolarity;
      } else {
        polarityBySite[node.site_name] =
          (polarityBySite[node.site_name] != nodePolarity) ?
            3 /* HYBRID */ :
            nodePolarity;
      }
    });
    alivePercAvg /= wirelessLinksCount;
    alivePercAvg = parseInt(alivePercAvg * 1000) / 1000.0;

    let nodeTypeRows = Object.keys(nodeTypes).map((nodeType, nodeIndex) => {
      let nodeTypeName = "Unknown";
      if (nodeType == 1) {
        nodeTypeName = 'CN';
      } else if (nodeType == 2) {
        nodeTypeName = 'DN';
      }
      let nodeTypeCount = nodeTypes[nodeType];
      let nodeTypeCountPerc =
        (parseInt(nodeTypeCount / this.props.topology.nodes.length * 100));
      return (
        <tr key={"nodeType-" + nodeType}>
          {nodeIndex == 0 ?
            <td width="150px" rowSpan={Object.keys(nodeTypes).length}>Node Types</td> : ""}
          <td>
            {nodeTypeName}
          </td>
          <td>
            {nodeTypeCount} ({nodeTypeCountPerc}%)
          </td>
        </tr>
      );
    });
    // compute polarity by site
    let polarityCountBySite = {};
    Object.values(polarityBySite).forEach(polarity => {
      if (!polarityCountBySite.hasOwnProperty(polarity)) {
        polarityCountBySite[polarity] = 0;
      }
      polarityCountBySite[polarity]++;
    });
    let polarityBySiteRows = Object.keys(polarityCountBySite).map((polarity, index) => {
      polarity = parseInt(polarity);
      let polarityName = "Not Set";
      if (polarity == 1) {
        polarityName = 'Odd';
      } else if (polarity == 2) {
        polarityName = 'Even';
      } else if (polarity == 3) {
        polarityName = 'Hybrid';
      }
      let polarityCount = polarityCountBySite[polarity];
      let polarityCountPerc =
        (parseInt(polarityCount / this.props.topology.sites.length * 100));
      return (
        <tr key={"polarityBySite-" + polarity}>
          {index == 0 ?
            <td width="150px" rowSpan={Object.keys(polarityCountBySite).length}>Polarities (Site)</td> : ""}
          <td>
            <span style={{color: polarityColor(parseInt(polarity))}}>
              {polarityName}
            </span>
          </td>
          <td>
            {polarityCount} ({polarityCountPerc}%)
          </td>
        </tr>
      );
    });
    let polarityRows = Object.keys(polarities).map((polarity, index) => {
      polarity = parseInt(polarity);
      let polarityName = "Not Set";
      if (polarity == 1) {
        polarityName = 'Odd';
      } else if (polarity == 2) {
        polarityName = 'Even';
      }
      let polarityCount = polarities[polarity];
      let polarityCountPerc =
        (parseInt(polarityCount / this.props.topology.nodes.length * 100));
      return (
        <tr key={"polarity-" + polarity}>
          {index == 0 ?
            <td width="150px" rowSpan={Object.keys(polarities).length}>Polarities (Sector)</td> : ""}
          <td>
            <span style={{color: polarityColor(polarity)}}>
              {polarityName}
            </span>
          </td>
          <td>
            {polarityCount} ({polarityCountPerc}%)
          </td>
        </tr>
      );
    });
    return (
      <div id="myModal" className="details">
        <div className="details-content">
          <div className="details-header">
            <span className="details-close" onClick={() => {this.props.onClose()}}>&times;</span>
            <h3 style={{marginTop: "0px"}}>Overview</h3>
          </div>
          <div className="details-body" style={{maxHeight: this.props.maxHeight}}>
            <table className="details-table" style={{width: '100%'}}>
              <tbody>
                <tr>
                  <td width="150px">Availability (24 Hours)</td>
                  <td colSpan="2">
                    <span style={{color: availabilityColor(alivePercAvg)}}>
                      {linksWithData ? alivePercAvg+'%' : 'No Data'}
                    </span>
                  </td>
                </tr>
                {nodeTypeRows}
                {polarityRows}
                {polarityBySiteRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}
