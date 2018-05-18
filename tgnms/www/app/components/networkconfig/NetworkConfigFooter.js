/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 */
'use strict';

import 'sweetalert/dist/sweetalert.css';

import {
  submitConfig,
  submitConfigForAllNodes,
  resetConfig,
  resetConfigForAllNodes,
} from '../../actions/NetworkConfigActions.js';
import {CONFIG_VIEW_MODE} from '../../constants/NetworkConfigConstants.js';
import PropTypes from 'prop-types';
import {render} from 'react-dom';
import React from 'react';
import swal from 'sweetalert';

const submitAlertProps = {
  title: 'Confirm Submit Config Changes',
  text: `You are about to submit configuration changes for node/network overrides
  This may cause the nodes or the network to reboot.

  Proceed?`,
  type: 'warning',
  showCancelButton: true,
  confirmButtonText: 'Submit Changes',
  cancelButtonText: 'Cancel',
};

export default class NetworkConfigFooter extends React.Component {
  constructor(props) {
    super(props);
  }

  onSubmitConfig() {
    swal(submitAlertProps, isConfirm => {
      if (isConfirm) {
        submitConfig();
      }
    });
  }

  onSubmitConfigForAllNodes() {
    swal(submitAlertProps, isConfirm => {
      if (isConfirm) {
        submitConfigForAllNodes();
      }
    });
  }

  onResetConfig() {
    resetConfig();
  }

  onResetAllConfig() {
    resetConfigForAllNodes();
  }

  // TODO: 4 button system for phase 1, custom alert system for phase 2
  render() {
    const {
      newConfigFields,
      draftConfig,
      editMode,
      nodesWithDrafts,
    } = this.props;

    return (
      <div className="rc-network-config-footer">
        <button
          className="nc-footer-btn"
          onClick={this.onResetConfig}
          disabled={
            Object.keys(draftConfig).length === 0 &&
            Object.keys(newConfigFields) === 0
          }>
          Discard Changes
        </button>
        {editMode === CONFIG_VIEW_MODE.NODE && (
          <button
            className="nc-footer-btn"
            onClick={this.onResetAllConfig}
            disabled={
              Object.keys(nodesWithDrafts).length === 0 &&
              Object.keys(newConfigFields) === 0
            }>
            Discard changes for all nodes
          </button>
        )}
        <button
          className="nc-footer-btn"
          onClick={this.onSubmitConfig}
          disabled={Object.keys(draftConfig).length === 0}>
          Submit Changes
        </button>
        {editMode === CONFIG_VIEW_MODE.NODE && (
          <button
            className="nc-footer-btn"
            onClick={this.onSubmitConfigForAllNodes}
            disabled={Object.keys(nodesWithDrafts).length === 0}>
            Submit changes for all nodes
          </button>
        )}
      </div>
    );
  }
}

NetworkConfigFooter.propTypes = {
  newConfigFields: PropTypes.object.isRequired,
  draftConfig: PropTypes.object.isRequired,
  editMode: PropTypes.string.isRequired,
  nodesWithDrafts: PropTypes.array.isRequired,
};
