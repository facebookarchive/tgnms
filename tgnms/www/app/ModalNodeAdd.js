import React from "react";
import { render } from "react-dom";
import Modal from "react-modal";
import Select from "react-select";
import NumericInput from "react-numeric-input";
import swal from "sweetalert";
import "sweetalert/dist/sweetalert.css";

const customModalStyle = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)"
  }
};

const nodeTypesVector = [
  { value: "DN", label: "DN" },
  { value: "CN", label: "CN" }
];

const nodePolaritiesVector = [
  { value: "ODD", label: "ODD" },
  { value: "EVEN", label: "EVEN" }
];

const polarityTypesVector = [
  { value: "ODD", label: "ODD" },
  { value: "EVEN", label: "EVEN" }
];

export default class ModalNodeAdd extends React.Component {
  state = {
    node_name: "",
    node_is_primary: false,
    node_type: null,
    node_mac_addr: "",
    node_is_pop: false,
    node_polarity: null,
    node_txGolayIdx: null,
    node_rxGolayIdx: null,
    node_site_name: null,
    node_ant_azimuth: null,
    node_has_cpe: false
  };

  componentDidMount() {}

  modalClose() {
    this.props.onClose();
  }

  addNode() {
    let newNode = {
      name: this.state.node_name,
      is_primary: this.state.node_is_primary,
      type: this.state.node_type,
      mac_addr: this.state.node_mac_addr,
      is_pop: this.state.node_is_pop,
      polarity: this.state.node_polarity,
      txGolayIdx: this.state.node_txGolayIdx,
      rxGolayIdx: this.state.node_rxGolayIdx,
      site_name: this.state.node_site_name,
      ant_azimuth: this.state.node_ant_azimuth,
      has_cpe: this.state.node_has_cpe
    };
    let postData = {
      topology: this.props.topology.name,
      newNode: newNode
    };
    swal(
      {
        title: "Are you sure?",
        text: "You are adding a node to this topology!",
        type: "warning",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "Yes, add it!",
        closeOnConfirm: false
      },
      function() {
        var request = new XMLHttpRequest();
        request.onload = function() {
          if (!request) {
            return;
          }
          if (request.status == 200) {
            swal({
              title: "Node Added!",
              text: "Response: " + request.statusText,
              type: "success"
            });
          } else {
            swal({
              title: "Failed!",
              text: "Adding a link failed\nReason: " + request.statusText,
              type: "error"
            });
          }
        }.bind(this);
        try {
          request.open("POST", "/controller/addNode", true);
          request.send(JSON.stringify(postData));
        } catch (e) {}
      }.bind(this)
    );
  }

  render() {
    var sitesVector = [];

    if (this.props.topology.sites) {
      Object(this.props.topology.sites).forEach(site => {
        sitesVector.push({
          value: site.name,
          label: site.name
        });
      });
    }

    return (
      <Modal
        isOpen={this.props.isOpen}
        onRequestClose={this.modalClose.bind(this)}
        style={customModalStyle}
        contentLabel="Example Modal"
      >
        <table>
          <tbody>
            <tr className="blank_row" />
            <tr>
              <td width={100}>Name <span className="required-asterisk">*</span></td>
              <td>
                <input
                  style={{ width: "100%", height: "34px" }}
                  type="text"
                  value={this.state.node_name}
                  onChange={event =>
                    this.setState({ node_name: event.target.value })
                  }
                />
              </td>
            </tr>
            <tr className="blank_row" />
            <tr>
              <td width={100}>MAC</td>
              <td>
                <input
                  style={{ width: "100%", height: "34px" }}
                  type="text"
                  value={this.state.node_mac_addr}
                  onChange={event =>
                    this.setState({ node_mac_addr: event.target.value })
                  }
                />
              </td>
            </tr>
            <tr className="blank_row" />
            <tr>
              <td width={100}>Site <span className="required-asterisk">*</span></td>
              <td>
                <Select
                  options={sitesVector}
                  name="Select Site"
                  value={this.state.node_site_name}
                  onChange={val => this.setState({ node_site_name: val.value })}
                  clearable={false}
                />
              </td>
            </tr>
            <tr className="blank_row" />
            <tr>
              <td width={100}>Type <span className="required-asterisk">*</span></td>
              <td>
                <Select
                  options={nodeTypesVector}
                  name="Select Site"
                  value={this.state.node_type}
                  onChange={val => this.setState({ node_type: val.value })}
                  clearable={false}
                />
              </td>
            </tr>
            <tr className="blank_row" />
            <tr>
              <td width={100}>Is Pop?</td>
              <td>
                <input
                  name="isPop"
                  type="checkbox"
                  checked={this.state.node_is_pop}
                  onChange={event =>
                    this.setState({ node_is_pop: event.target.checked })
                  }
                />
              </td>
            </tr>
            <tr className="blank_row" />
            <tr>
              <td width={100}>Is Primary?</td>
              <td>
                <input
                  name="isPrimary"
                  type="checkbox"
                  checked={this.state.node_is_primary}
                  onChange={event =>
                    this.setState({ node_is_primary: event.target.checked })
                  }
                />
              </td>
            </tr>
            <tr className="blank_row" />
            <tr>
              <td width={100}>Polarity</td>
              <td>
                <Select
                  options={nodePolaritiesVector}
                  name="Select Polarity"
                  value={this.state.node_polarity}
                  onChange={val => this.setState({ node_polarity: val.value })}
                  clearable={false}
                />
              </td>
            </tr>
            <tr className="blank_row" />
            <tr>
              <td width={100}>Tx Golay Index</td>
              <td>
                <NumericInput
                  className="form-control"
                  style={false}
                  value={this.state.node_txGolayIdx}
                  onChange={val => this.setState({ node_txGolayIdx: val })}
                />
              </td>
            </tr>
            <tr className="blank_row" />
            <tr>
              <td width={100}>Rx Golay Index</td>
              <td>
                <NumericInput
                  className="form-control"
                  style={false}
                  value={this.state.node_rxGolayIdx}
                  onChange={val => this.setState({ node_rxGolayIdx: val })}
                />
              </td>
            </tr>
            <tr className="blank_row" />
            <tr>
              <td colSpan="3">
                <span className="text-muted">
                  <em>
                    <span className="required-asterisk">*</span> Indicates required field
                  </em>
                </span>
              </td>
            </tr>
            <tr className="blank_row" />
            <tr>
              <td width={100} />
              <td>
                <button
                  style={{ float: "right" }}
                  className="graph-button"
                  onClick={this.modalClose.bind(this)}
                >
                  Close
                </button>
                <button
                  style={{ float: "right" }}
                  className="graph-button"
                  onClick={this.addNode.bind(this)}
                >
                  Add Node
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </Modal>
    );
  }
}
