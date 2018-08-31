/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 */
'use strict';

import 'sweetalert/dist/sweetalert.css';

import {render} from 'react-dom';
import Modal from 'react-modal';
import React from 'react';
import swal from 'sweetalert';

const customModalStyle = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

export default class ModalCSVUpload extends React.Component {
  state = {
    enableSubmit: false,
    topology: {},
  };

  modalClose() {
    this.props.onClose();
  }

  uploadCSV() {
    const fileInput = document.getElementById('fileInput');
    const reader = new window.FileReader();
    let rows = [];

    reader.onload = function(e) {
      // Split on newlines and ignore the 2 header rows
      rows = reader.result.split(/\n/).slice(2);
      const topology = this.generateTopology(rows);

      const jsonTopology =
        'data:text/json;charset=utf-8,' +
        encodeURIComponent(JSON.stringify(topology, 0, 4));
      const downloadElement = document.getElementById('downloadElement');
      downloadElement.setAttribute('href', jsonTopology);
      downloadElement.setAttribute('download', 'topology.json');

      swal({
        title: 'Topology generated!',
        text: 'Topology successfully generated',
        type: 'success',
      });

      downloadElement.click();
    }.bind(this);

    if (fileInput.files.length == 0) {
      swal({title: 'Select a file!'});
    } else {
      try {
        reader.readAsText(fileInput.files[0]);
      } catch (ex) {
        swal({title: 'Error uploading file'});
      }
    }
  }

  generateTopology(rows) {
    // Skeleton topology object that will be populated with CSV data
    // TODO - prompt for topology name
    // nodesSeen - object with keys of sector
    // names and values of sector details
    const nodesSeen = {};
    const linksSeen = {};
    const sitesSeen = {};
    rows.forEach(row => {
      const column = row.split(',');
      if (column.length < 10) {
        swal({title: 'Invalid input', text: 'Row: ' + row.substr(0, 10)});
        return;
      }
      const rowDeets = {
        localName: column[0],
        localNode: column[0].split('.')[0],
        localSector: column[0].split('.')[1],
        localLat: parseFloat(column[1]),
        localLong: parseFloat(column[2]),
        localNodeType: column[3],
        localPop: column[4].toLowerCase() == 'yes',
        localElev: parseInt(column[5]),
        remoteName: column[6],
        remoteNode: column[6].split('.')[0],
        remoteSector: column[6].split('.')[1],
        remoteLat: parseFloat(column[7]),
        remoteLong: parseFloat(column[8]),
        remoteNodeType: column[9],
        remotePop: column[10].toLowerCase() == 'yes',
        remoteElev: parseInt(column[11]),
      };

      // NODES
      if (!nodesSeen.hasOwnProperty(rowDeets.localName)) {
        const node = {
          name: rowDeets.localName,
          mac_addr: rowDeets.localMac || null,
          site_name: rowDeets.localNode,
          pop_node: rowDeets.localPop,
          node_type: rowDeets.localNodeType.toLowerCase() == 'cn' ? 1 : 2,
          polarity: null,
          golay_idx: {
            txGolayIdx: null,
            rxGolayIdx: null,
          },
        };
        nodesSeen[rowDeets.localName] = node;
      }

      if (!nodesSeen.hasOwnProperty(rowDeets.remoteName)) {
        const node = {
          name: rowDeets.remoteName,
          mac_addr: rowDeets.remoteMac || null,
          site_name: rowDeets.remoteNode,
          pop_node: rowDeets.remotePop,
          node_type: rowDeets.remoteNodeType.toLowerCase() == 'cn' ? 1 : 2,
          polarity: null,
          golay_idx: {
            txGolayIdx: null,
            rxGolayIdx: null,
          },
        };
        nodesSeen[rowDeets.remoteName] = node;
      }

      // LINK
      let aEnd = null;
      let zEnd = null;
      if (rowDeets.localName < rowDeets.remoteName) {
        aEnd = nodesSeen[rowDeets.localName];
        zEnd = nodesSeen[rowDeets.remoteName];
      } else {
        aEnd = nodesSeen[rowDeets.remoteName];
        zEnd = nodesSeen[rowDeets.localName];
      }

      const linkName = 'link-' + aEnd.name + '-' + zEnd.name;
      if (
        !linksSeen.hasOwnProperty(linkName) &&
        rowDeets.remoteNode != rowDeets.localNode
      ) {
        const link = {
          name: linkName,
          a_node_name: aEnd.name,
          z_node_name: zEnd.name,
          link_type: 1 /* WIRELESS, ETHERNET */,
          is_alive: false,
        };
        linksSeen[linkName] = link;
      }
      // add ethernet connections in the same site

      // SITES
      if (!sitesSeen.hasOwnProperty(rowDeets.localNode)) {
        const site = {
          name: rowDeets.localNode,
          location: {
            latitude: rowDeets.localLat,
            longitude: rowDeets.localLong,
            altitude: rowDeets.localElev,
          },
        };
        sitesSeen[rowDeets.localNode] = site;
      }

      if (!sitesSeen.hasOwnProperty(rowDeets.remoteNode)) {
        const site = {
          name: rowDeets.remoteNode,
          location: {
            latitude: rowDeets.remoteLat,
            longitude: rowDeets.remoteLong,
            altitude: rowDeets.remoteElev,
          },
        };
        sitesSeen[rowDeets.remoteNode] = site;
      }
    });
    // add ETHERNET links
    // index nodes by site
    const nodesBySite = {};
    Object.values(nodesSeen).forEach(node => {
      if (!nodesBySite.hasOwnProperty(node.site_name)) {
        nodesBySite[node.site_name] = [];
      }
      nodesBySite[node.site_name].push(node);
    });
    Object.keys(nodesBySite).forEach(siteName => {
      const nodesOnSite = nodesBySite[siteName];
      // add the nodes
      nodesOnSite.forEach((node, index) => {
        if (index >= 1) {
          // add link from node 0
          let aNode = nodesOnSite[0];
          let zNode = nodesOnSite[index];
          if (zNode.name < aNode.name) {
            // swap nodes
            aNode = nodesOnSite[index];
            zNode = nodesOnSite[0];
          }
          const linkName = 'link-' + aNode.name + '-' + zNode.name;
          const link = {
            name: linkName,
            a_node_name: aNode.name,
            z_node_name: zNode.name,
            link_type: 2 /* WIRELESS, ETHERNET */,
            is_alive: true,
          };
          linksSeen[linkName] = link;
        }
      });
    });
    const topology = {
      name: 'Example Topology',
      nodes: Object.values(nodesSeen),
      links: Object.values(linksSeen),
      sites: Object.values(sitesSeen),
    };
    return topology;
  }

  render() {
    const nodesVector = [];

    if (this.props.topology.nodes) {
      Object(this.props.topology.nodes).forEach(node => {
        nodesVector.push({
          value: node.name,
          label: node.name,
        });
      });
    }

    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.modalClose.bind(this)}
        style={customModalStyle}>
        <table>
          <tbody>
            <tr className="blank_row" />
            <tr>
              <td width={100}>CSV</td>
              <td>
                <input type="file" style={{float: 'right'}} id="fileInput" />
              </td>
            </tr>
            <tr className="blank_row" />
            <tr>
              <td width={100} />
              <td>
                <button
                  style={{float: 'right'}}
                  className="graph-button"
                  onClick={this.modalClose.bind(this)}>
                  close
                </button>
                <button
                  style={{float: 'right'}}
                  className="graph-button"
                  onClick={this.uploadCSV.bind(this)}>
                  submit
                </button>
              </td>
            </tr>
            <tr>
              <td width={100} />
              <td>
                <a id="downloadElement" />
              </td>
            </tr>
          </tbody>
        </table>
      </Modal>
    );
  }
}
