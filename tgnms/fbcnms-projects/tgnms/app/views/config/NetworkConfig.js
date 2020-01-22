/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow
 */

import ConfigRoot from './ConfigRoot';
import React from 'react';
import {
  ConfigLayer,
  DEFAULT_BASE_KEY,
  DEFAULT_FIRMWARE_BASE_KEY,
  DEFAULT_HARDWARE_BASE_KEY,
  NetworkConfigMode,
  SELECTED_NODE_QUERY_PARAM,
} from '../../constants/ConfigConstants';
import {History} from 'history';
import {cloneDeep, get, merge} from 'lodash';
import {
  getAutoOverridesConfig,
  getBaseConfig,
  getConfigBundleStatus,
  getConfigMetadata,
  getFirmwareBaseConfig,
  getHardwareBaseConfig,
  getNetworkOverridesConfig,
  getNodeOverridesConfig,
  setNetworkOverridesConfig,
  setNodeOverridesConfig,
} from '../../apiutils/ConfigAPIUtil';
import {
  getFirmwareVersions,
  getNodeVersions,
  getTopologyNodeList,
} from '../../helpers/ConfigHelpers';
import {withRouter} from 'react-router-dom';
import {withStyles} from '@material-ui/core/styles';

import type {NetworkConfig as NetworkConfigType} from '../../NetworkContext';
import type {NodeConfigStatusType} from '../../helpers/ConfigHelpers';
import type {NodeConfigType} from '../../../shared/types/NodeConfig';

const styles = {};

type Props = {
  classes: {[string]: string},
  history: History,
  networkName: string,
  networkConfig: NetworkConfigType,
};

type State = {
  autoOverridesConfig: ?{[string]: $Shape<NodeConfigType>},
  baseConfigs: ?{[string]: $Shape<NodeConfigType>},
  configMetadata: ?{[string]: $Shape<NodeConfigType>},
  firmwareBaseConfigs: ?{[string]: $Shape<NodeConfigType>},
  hardwareBaseConfigs: ?{[string]: {[string]: $Shape<NodeConfigType>}},
  networkOverridesConfig: ?$Shape<NodeConfigType>,
  nodeOverridesConfig: ?{[string]: $Shape<NodeConfigType>},
  selectedNodeInfo: ?NodeConfigStatusType,
  selectedImage: string,
  selectedHardwareType: string,
  selectedFirmwareVersion: string,
};

class NetworkConfig extends React.Component<Props, State> {
  constructor(props) {
    super(props);
    const {networkConfig} = this.props;

    this.state = {
      // === Base layers ===
      // Map of software version to base config
      baseConfigs: null,
      // Map of hardware model to base config
      hardwareBaseConfigs: null,
      // Map of firmware to base config
      firmwareBaseConfigs: null,

      // === Override layers ===
      // Automatic node overrides layer (read-only for NMS)
      autoOverridesConfig: null,
      // Network overrides layer
      networkOverridesConfig: null,
      // Node overrides layer
      nodeOverridesConfig: null,

      // Config metadata structures
      configMetadata: null,

      // Currently selected node (in NODE view)
      // Data structure is defined in getTopologyNodeList() in ConfigHelpers
      selectedNodeInfo: this.getNodeFromQueryString(networkConfig) || null,

      // Currently selected image version / hardware type
      selectedImage: DEFAULT_BASE_KEY,
      selectedHardwareType: DEFAULT_HARDWARE_BASE_KEY,
      selectedFirmwareVersion:
        this.getCurrentFirmwareVersion(networkConfig) ||
        DEFAULT_FIRMWARE_BASE_KEY,
    };
  }

  refreshNodeupdateStatusInterval: ?IntervalID = null;

  componentDidMount() {
    this.refreshNodeupdateBundleStatus();
    // Refresh nodeupdate bundle status periodically
    // Only do this for the selected node (for now due to nodeupdate's API)
    this.refreshNodeupdateStatusInterval = setInterval(
      this.refreshNodeupdateBundleStatus,
      10000,
    );
  }

  componentWillUnmount() {
    clearInterval(this.refreshNodeupdateStatusInterval);
  }

  refreshNodeupdateBundleStatus = () => {
    // If a node is selected, update its nodeupdate bundle status
    const oldSelectedNodeInfo = this.state.selectedNodeInfo;
    if (oldSelectedNodeInfo) {
      getConfigBundleStatus(
        oldSelectedNodeInfo.macAddr,
        nodeupdateBundleServed => {
          const {selectedNodeInfo} = this.state;
          if (
            selectedNodeInfo &&
            selectedNodeInfo.macAddr === oldSelectedNodeInfo.macAddr
          ) {
            // Set new status
            const newNodeInfo = {...selectedNodeInfo, nodeupdateBundleServed};
            this.setState({selectedNodeInfo: newNodeInfo});
          }
        },
        _err => {
          const {selectedNodeInfo} = this.state;
          if (
            selectedNodeInfo &&
            selectedNodeInfo.macAddr === oldSelectedNodeInfo.macAddr
          ) {
            // Delete status for node on error
            const newNodeInfo = {...selectedNodeInfo};
            this.setState({selectedNodeInfo: newNodeInfo});
          }
        },
      );
    }
  };

  getCurrentFirmwareVersion(networkConfig) {
    const firmWareVersion = getFirmwareVersions(networkConfig)[0];
    return (
      firmWareVersion?.substring(0, firmWareVersion.lastIndexOf('.')) || null
    );
  }

  getNodeFromQueryString(networkConfig) {
    const values = new URL(window.location).searchParams;
    const name = values.get(SELECTED_NODE_QUERY_PARAM);
    if (!name) {
      return null;
    }
    const nodes = getTopologyNodeList(networkConfig, null);
    return nodes.find(node => node.name === name) || null;
  }

  getSidebarProps = editMode => {
    // Get ConfigSidebar properties
    const {networkConfig} = this.props;
    const {
      baseConfigs,
      hardwareBaseConfigs,
      firmwareBaseConfigs,
      nodeOverridesConfig,
      selectedImage,
      selectedFirmwareVersion,
      selectedHardwareType,
      selectedNodeInfo,
    } = this.state;

    return {
      editMode,
      selectedNodeInfo,
      baseConfigs,
      hardwareBaseConfigs,
      firmwareBaseConfigs,
      selectedImage,
      selectedFirmwareVersion,
      selectedHardwareType,
      topologyNodeList: getTopologyNodeList(networkConfig, nodeOverridesConfig),
    };
  };

  getRequests = isInitial => {
    // Prepare all API requests
    const {networkConfig} = this.props;

    // Find all image versions based on current topology
    const imageVersions = [DEFAULT_BASE_KEY, ...getNodeVersions(networkConfig)];
    const data = {swVersions: [DEFAULT_BASE_KEY, ...imageVersions]};

    //firmware
    const firmwareData = {
      apiData: {fwVersions: []},
      ctrlVersion: networkConfig.controller_version,
      defaultCfg: {none: {}},
    };

    return [
      // Get base configs and metadata
      ...(isInitial
        ? [
            {func: getConfigMetadata, key: 'configMetadata'},
            {func: getBaseConfig, key: 'baseConfigs', data},
            {
              func: getFirmwareBaseConfig,
              key: 'firmwareBaseConfigs',
              data: firmwareData,
            },
            {func: getHardwareBaseConfig, key: 'hardwareBaseConfigs', data},
          ]
        : []),

      // Get overrides
      {func: getAutoOverridesConfig, key: 'autoOverridesConfig'},
      {func: getNetworkOverridesConfig, key: 'networkOverridesConfig'},
      {func: getNodeOverridesConfig, key: 'nodeOverridesConfig'},
    ];
  };

  getBaseLayer = editMode => {
    // Get base layer
    const {
      baseConfigs,
      hardwareBaseConfigs,
      firmwareBaseConfigs,
      selectedNodeInfo,
      selectedImage,
      selectedFirmwareVersion,
      selectedHardwareType,
    } = this.state;

    // Merge software version base with hardware-specific base
    let imageVersion, firmwareVersion, hardwareType;
    if (editMode === NetworkConfigMode.NETWORK) {
      imageVersion = selectedImage;
      firmwareVersion = selectedFirmwareVersion;
      hardwareType = selectedHardwareType;
    } else if (editMode === NetworkConfigMode.NODE && selectedNodeInfo) {
      imageVersion = selectedNodeInfo.version || DEFAULT_BASE_KEY;
      firmwareVersion = selectedFirmwareVersion || DEFAULT_FIRMWARE_BASE_KEY;
      hardwareType =
        selectedNodeInfo.hardwareBoardId || DEFAULT_HARDWARE_BASE_KEY;
    } else {
      // No node possible to select
      return null;
    }
    const baseConfig = baseConfigs ? baseConfigs[imageVersion] : {};
    const firmwareOverrides =
      firmwareBaseConfigs && firmwareBaseConfigs[firmwareVersion]
        ? firmwareBaseConfigs[firmwareVersion]
        : {};
    const hardwareOverrides = get(
      hardwareBaseConfigs,
      [hardwareType, imageVersion],
      {},
    );
    return merge(cloneDeep(baseConfig), firmwareOverrides, hardwareOverrides);
  };

  getConfigLayers = editMode => {
    // Return the current config layers
    const {
      selectedNodeInfo,
      autoOverridesConfig,
      networkOverridesConfig,
      nodeOverridesConfig,
    } = this.state;

    // Get base layer
    const baseLayer = this.getBaseLayer(editMode);
    if (baseLayer === null) {
      return []; // no node selected, so don't render anything
    }

    return [
      {id: ConfigLayer.BASE, value: baseLayer},
      ...(editMode === NetworkConfigMode.NETWORK
        ? [
            // Network-only layers
            {id: ConfigLayer.NETWORK, value: networkOverridesConfig || {}},
          ]
        : [
            // Node layers
            {
              id: ConfigLayer.AUTO_NODE,
              value: get(
                autoOverridesConfig,
                selectedNodeInfo ? selectedNodeInfo.name : '',
                {},
              ),
            },
            {id: ConfigLayer.NETWORK, value: networkOverridesConfig || {}},
            {
              id: ConfigLayer.NODE,
              value: get(
                nodeOverridesConfig,
                selectedNodeInfo ? selectedNodeInfo.name : '',
                {},
              ),
            },
          ]),
    ];
  };

  getConfigMetadata = _editMode => {
    // Return the current config metadata
    const {configMetadata} = this.state;

    return configMetadata;
  };

  getConfigOverrides = editMode => {
    // Get the current override layer
    const {
      networkOverridesConfig,
      nodeOverridesConfig,
      selectedNodeInfo,
    } = this.state;

    if (editMode === NetworkConfigMode.NETWORK) {
      return networkOverridesConfig;
    } else if (editMode === NetworkConfigMode.NODE && selectedNodeInfo) {
      return get(nodeOverridesConfig, selectedNodeInfo.name, {});
    } else {
      return {};
    }
  };

  handleSubmitDraft = (editMode, draftConfig, onSuccess, onError) => {
    // Submit all draft changes
    const {selectedNodeInfo} = this.state;
    const {networkName} = this.props;

    if (editMode === NetworkConfigMode.NETWORK) {
      setNetworkOverridesConfig(networkName, draftConfig, onSuccess, onError);
    } else if (editMode === NetworkConfigMode.NODE && selectedNodeInfo) {
      const nodeConfig = {[selectedNodeInfo.name]: draftConfig};
      setNodeOverridesConfig(networkName, nodeConfig, onSuccess, onError);
    }
  };

  handleEditModeChange = editMode => {
    // Handle an edit mode change
    const {networkConfig} = this.props;
    const {nodeOverridesConfig, selectedNodeInfo} = this.state;

    // If changing to NODE view, set the selected node if unset
    if (editMode === NetworkConfigMode.NODE && selectedNodeInfo === null) {
      const topologyNodeList = getTopologyNodeList(
        networkConfig,
        nodeOverridesConfig,
      );
      if (topologyNodeList.length > 0) {
        this.handleSelectNode(topologyNodeList[0]);
      }
    }
  };

  handleSelectNode = (node, callback) => {
    // Select a node in the sidebar
    const {selectedNodeInfo} = this.state;

    if (node && selectedNodeInfo && selectedNodeInfo.name === node.name) {
      return; // already selected
    }
    this.setState({selectedNodeInfo: node}, () => {
      callback && callback();
      this.props.history.replace({
        search: `?${SELECTED_NODE_QUERY_PARAM}=${node ? node.name : ''}`,
      });
      // Refresh nodeupdate bundle status immediately
      this.refreshNodeupdateBundleStatus();
    });
  };

  handleSelectImage = (image, callback) => {
    // Select a software image in the sidebar
    if (this.state.selectedImage === image) {
      return; // already selected
    }
    this.setState({selectedImage: image}, callback);
  };

  handleSelectHardwareType = (hardwareType, callback) => {
    // Select a hardware type in the sidebar
    if (this.state.selectedHardwareType === hardwareType) {
      return; // already selected
    }
    this.setState({selectedHardwareType: hardwareType}, callback);
  };

  handleSelectFirmwareVersion = (firmWareVersion, callback) => {
    // Select a firmware version in the sidebar
    if (this.state.selectedFirmwareVersion === firmWareVersion) {
      return; // already selected
    }
    this.setState({selectedFirmwareVersion: firmWareVersion}, callback);
  };

  render() {
    const {networkConfig, networkName} = this.props;
    const {selectedNodeInfo} = this.state;

    return (
      <ConfigRoot
        networkName={networkName}
        networkConfig={networkConfig}
        editModes={NetworkConfigMode}
        initialEditMode={
          selectedNodeInfo ? NetworkConfigMode.NODE : NetworkConfigMode.NETWORK
        }
        setParentState={this.setState.bind(this)}
        getSidebarProps={this.getSidebarProps}
        getRequests={this.getRequests}
        getConfigLayers={this.getConfigLayers}
        getConfigMetadata={this.getConfigMetadata}
        getConfigOverrides={this.getConfigOverrides}
        onSubmitDraft={this.handleSubmitDraft}
        onEditModeChanged={this.handleEditModeChange}
        onSelectNode={this.handleSelectNode}
        onSelectImage={this.handleSelectImage}
        onSelectFirmwareVersion={this.handleSelectFirmwareVersion}
        onSelectHardwareType={this.handleSelectHardwareType}
      />
    );
  }
}

export default withStyles(styles)(withRouter(NetworkConfig));
