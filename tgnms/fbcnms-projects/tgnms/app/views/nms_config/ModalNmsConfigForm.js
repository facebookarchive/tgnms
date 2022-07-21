/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import Button from '@material-ui/core/Button';
import MaterialModal from '@fbcnms/tg-nms/app/components/common/MaterialModal';
import MenuItem from '@material-ui/core/MenuItem';
import NetworkListContext from '@fbcnms/tg-nms/app/contexts/NetworkListContext';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import {WAC_TYPES} from '@fbcnms/tg-nms/shared/dto/NetworkState';
import {
  createNumericInput,
  createSelectInput,
  createTextInput,
  formParseInt,
} from '@fbcnms/tg-nms/app/helpers/FormHelpers';
import {toTitleCase} from '@fbcnms/tg-nms/app/helpers/StringHelpers';
import {withStyles} from '@material-ui/core/styles';
import type {NetworkConfig} from '@fbcnms/tg-nms/app/contexts/NetworkContext';

type InputType = {
  _heading?: string,
  autoFocus?: boolean,
  func: (InputType, State, Object) => any,
  label?: string,
  menuItems?: Array<Object>,
  placeholder?: ?string,
  required?: boolean,
  step?: number,
  value?: string,
};

const styles = theme => ({
  button: {
    margin: theme.spacing(),
  },
  modalContent: {
    paddingBottom: theme.spacing(),
  },
  formHeading: {
    fontSize: '1.05rem',
    paddingTop: 12,
  },
  red: {
    color: 'red',
  },
});

const FormType = Object.freeze({
  CREATE: 'CREATE',
  EDIT: 'EDIT',
});

const DEFAULT_CONTROLLER_CONFIG = Object.freeze({
  api_port: 8080,
  e2e_port: 17077,
  api_ip: '',
  e2e_ip: '',
});

type Props = {
  classes: {[string]: string},
  open: boolean,
  networkConfig: NetworkConfig,
  onClose: () => any,
  onCreateNetwork: (
    $Shape<NetworkConfig>,
    () => any,
    ?({}) => any,
    ?({}) => any,
  ) => any,
  onEditNetwork: (
    $Shape<NetworkConfig>,
    () => any,
    ?({}) => any,
    ?({}) => any,
  ) => any,
  networkList: NetworkConfig,
  type: $Values<typeof FormType>,
};

type State = {
  network: string,
  primaryApiIp: string,
  primaryE2eIp: string,
  primaryApiPort: number,
  primaryE2ePort: number,
  backupApiIp: string,
  backupE2eIp: string,
  backupApiPort: number,
  backupE2ePort: number,
  wacType: $Values<typeof WAC_TYPES>,
  wacUrl: string,
  wacUsername: string,
  wacPassword: string,
  prometheus_url: string,
  queryservice_url: string,
  alertmanager_url: ?string,
  alertmanager_config_url: ?string,
  prometheus_config_url: ?string,
  event_alarm_url: ?string,
  formErrors: {},
};

class ModalNmsConfigForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    // Copy initial values from networkConfig since we allow editing values
    this.state = this.getState(props);
  }

  getState(props): State {
    // Compute the form state based on the given props
    let {networkConfig} = props;
    if (networkConfig === undefined) {
      networkConfig = {};
    }
    if (!networkConfig.hasOwnProperty('primary')) {
      networkConfig.primary = DEFAULT_CONTROLLER_CONFIG;
    }
    if (!networkConfig.hasOwnProperty('backup')) {
      networkConfig.backup = DEFAULT_CONTROLLER_CONFIG;
    }
    return {
      network: networkConfig.name || '',
      primaryApiIp: networkConfig.primary.api_ip,
      primaryE2eIp: networkConfig.primary.e2e_ip || '',
      primaryApiPort: networkConfig.primary.api_port,
      primaryE2ePort: networkConfig.primary.e2e_port,
      backupApiIp: networkConfig.backup?.api_ip ?? '',
      backupE2eIp: networkConfig.backup?.e2e_ip ?? '',
      backupApiPort: networkConfig.backup?.api_port ?? 0,
      backupE2ePort: networkConfig.backup?.e2e_port ?? 0,
      prometheus_url: networkConfig.prometheus_url ?? '',
      queryservice_url: networkConfig.queryservice_url ?? '',
      alertmanager_url: networkConfig.alertmanager_url ?? '',
      alertmanager_config_url: networkConfig.alertmanager_config_url ?? '',
      prometheus_config_url: networkConfig.prometheus_config_url ?? '',
      event_alarm_url: networkConfig.event_alarm_url ?? '',
      wacType: networkConfig.wireless_controller?.type || WAC_TYPES.none,
      wacUrl: networkConfig.wireless_controller
        ? networkConfig.wireless_controller.url
        : '',
      wacUsername: networkConfig.wireless_controller
        ? networkConfig.wireless_controller.username
        : '',
      wacPassword: '' /* we don't pass this from the server */,
      formErrors: {},
    };
  }

  onEnter = () => {
    // Reset state with new props on enter
    const newState = this.getState(this.props);
    this.setState(newState);
  };

  validatePort(portNum) {
    // Verify that port number is valid
    return portNum >= 0 && portNum <= 65535;
  }

  handleSubmit = waitForNetworkListRefresh => {
    // Submit the form
    const {networkConfig, type, onClose, networkList} = this.props;
    const {
      network,
      primaryApiIp,
      primaryApiPort,
      primaryE2eIp,
      primaryE2ePort,
      backupApiIp,
      backupApiPort,
      backupE2eIp,
      backupE2ePort,
      prometheus_url,
      queryservice_url,
      alertmanager_url,
      alertmanager_config_url,
      prometheus_config_url,
      event_alarm_url,
      wacType,
      wacUrl,
      wacUsername,
      wacPassword,
    } = this.state;

    // Validate form fields
    const errors = {};
    if (networkList.hasOwnProperty(network)) {
      if (type === FormType.CREATE || network !== networkConfig.name) {
        errors.network =
          'This network name is already taken. Please use a different name.';
      }
    }
    if (network.trim() === '') {
      errors.network = 'Please enter a name.';
    }
    if (!this.validatePort(primaryApiPort)) {
      errors.primaryApiPort = 'Please enter a valid port number.';
    }
    if (!this.validatePort(primaryE2ePort)) {
      errors.primaryE2ePort = 'Please enter a valid port number.';
    }
    if (primaryApiIp.trim() === '') {
      errors.primaryApiIp = 'Please enter a hostname.';
    }
    if (backupApiIp !== '') {
      if (!this.validatePort(backupApiPort)) {
        errors.backupApiPort = 'Please enter a vaid port number.';
      }
      if (!this.validatePort(backupE2ePort)) {
        errors.backupE2ePort = 'Please enter a valid port number.';
      }
      if (backupApiIp.trim() === '') {
        errors.backupApiIp = 'Please enter a hostname.';
      }
    }
    if (wacType !== WAC_TYPES.none) {
      if (wacUrl.trim() === '') {
        errors.wacUrl = 'Please enter a URL.';
      }
      if (wacUsername === '') {
        errors.wacUsername = 'Please enter a username.';
      }
      if (
        wacPassword === '' &&
        (type === FormType.CREATE ||
          (type == FormType.EDIT && !networkConfig.wireless_controller))
      ) {
        errors.wacPassword = 'Please enter a password.';
      }
    }
    if (Object.keys(errors).length > 0) {
      this.setState({formErrors: errors});
      return;
    }

    // Construct request
    const data = {
      id: -1,
      name: network.trim(),
      primary: {
        api_ip: primaryApiIp ? primaryApiIp.trim() : '',
        api_port: formParseInt(this.state.primaryApiPort),
        e2e_ip: primaryE2eIp ? primaryE2eIp.trim() : '',
        e2e_port: formParseInt(this.state.primaryE2ePort),
      },
      backup: {
        api_ip: backupApiIp ? backupApiIp.trim() : '',
        api_port: formParseInt(this.state.backupApiPort),
        e2e_ip: backupE2eIp ? backupE2eIp.trim() : '',
        e2e_port: formParseInt(this.state.backupE2ePort),
      },
      prometheus_url,
      queryservice_url,
      alertmanager_url,
      alertmanager_config_url,
      prometheus_config_url,
      event_alarm_url,
      ...(wacType !== WAC_TYPES.none
        ? {
            wireless_controller: {
              type: wacType,
              url: wacUrl.trim(),
              username: wacUsername,
              password: wacPassword,
            },
          }
        : {}),
    };

    if (type === FormType.CREATE) {
      this.props.onCreateNetwork(data, waitForNetworkListRefresh);
    } else if (type === FormType.EDIT) {
      data.id = networkConfig.id;
      this.props.onEditNetwork(data, waitForNetworkListRefresh);
    }
    onClose();
  };

  render() {
    return (
      <NetworkListContext.Consumer>
        {this.renderContext}
      </NetworkListContext.Consumer>
    );
  }

  renderContext = listContext => {
    const {classes, open, type, onClose, networkConfig} = this.props;
    const {formErrors} = this.state;
    const {waitForNetworkListRefresh} = listContext;
    const title =
      type === FormType.CREATE
        ? 'Add Network'
        : type === FormType.EDIT
        ? 'Edit Network'
        : '?';

    // Create inputs
    const inputs: Array<InputType> = [
      {
        func: createTextInput,
        label: 'Network',
        value: 'network',
        required: true,
        autoFocus: true,
      },
      {_heading: 'Primary Controller', func: () => null},
      {
        func: createTextInput,
        label: 'Primary API Hostname',
        value: 'primaryApiIp',
        required: true,
      },
      {
        func: createNumericInput,
        label: 'Primary API Port',
        value: 'primaryApiPort',
        step: 1,
        required: true,
      },
      {
        func: createTextInput,
        label: 'Primary E2E Hostname',
        value: 'primaryE2eIp',
        required: true,
      },
      {
        func: createNumericInput,
        label: 'Primary E2E Port',
        value: 'primaryE2ePort',
        step: 1,
        required: true,
      },
      {_heading: 'Backup Controller', func: () => null},
      {
        func: createTextInput,
        label: 'Backup API Hostname',
        value: 'backupApiIp',
      },
      {
        func: createNumericInput,
        label: 'Backup API Port',
        value: 'backupApiPort',
        step: 1,
      },
      {
        func: createTextInput,
        label: 'Backup E2E Hostname',
        value: 'backupE2eIp',
      },
      {
        func: createNumericInput,
        label: 'Backup E2E Port',
        value: 'backupE2ePort',
        step: 1,
      },
      {_heading: 'Stats', func: () => null},
      {
        func: createTextInput,
        label: 'Prometheus URL',
        value: 'prometheus_url',
      },
      {
        func: createTextInput,
        label: 'Queryservice URL',
        value: 'queryservice_url',
      },
      {
        func: createTextInput,
        label: 'Alertmanager URL',
        value: 'alertmanager_url',
      },
      {
        func: createTextInput,
        label: 'Alertmanager Config URL',
        value: 'alertmanager_config_url',
      },
      {
        func: createTextInput,
        label: 'Prometheus Config URL',
        value: 'prometheus_config_url',
      },
      {
        func: createTextInput,
        label: 'Event Alarms URL',
        value: 'event_alarm_url',
      },
      {_heading: 'Wireless AP Controller', func: () => null},
      {
        func: createSelectInput,
        label: 'AP Type',
        value: 'wacType',
        menuItems: Object.keys(WAC_TYPES).map(wacType => (
          <MenuItem key={wacType} value={wacType}>
            {toTitleCase(wacType)}
          </MenuItem>
        )),
      },
      ...(this.state.wacType === WAC_TYPES.none
        ? []
        : [
            {
              func: createTextInput,
              label: 'URL',
              value: 'wacUrl',
            },
            {
              func: createTextInput,
              label: 'Username',
              value: 'wacUsername',
            },
            {
              func: createTextInput,
              label: 'Password',
              placeholder:
                type == FormType.EDIT && networkConfig.wireless_controller
                  ? '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'
                  : null,
              value: 'wacPassword',
              isPassword: true,
            },
          ]),
    ];

    return (
      <MaterialModal
        open={open}
        onClose={onClose}
        onEnter={this.onEnter}
        modalTitle={title}
        modalContentText="Fill out the network configuration in the form below."
        modalContent={
          <div className={classes.modalContent}>
            {inputs.map(input =>
              input.hasOwnProperty('_heading') ? (
                <Typography
                  key={input._heading}
                  className={classes.formHeading}
                  variant="h6">
                  {input._heading}
                </Typography>
              ) : (
                <React.Fragment key={input.value}>
                  {input.func({...input}, this.state, this.setState.bind(this))}
                  {formErrors.hasOwnProperty(input.value) ? (
                    <Typography variant="subtitle2" className={classes.red}>
                      {input.value ? formErrors[input.value] : null}
                    </Typography>
                  ) : null}
                </React.Fragment>
              ),
            )}
          </div>
        }
        modalActions={
          <>
            <Button
              className={classes.button}
              onClick={() => this.handleSubmit(waitForNetworkListRefresh)}
              variant="outlined">
              Save
            </Button>
            <Button
              className={classes.button}
              onClick={onClose}
              variant="outlined">
              Cancel
            </Button>
          </>
        }
      />
    );
  };
}

export default withStyles(styles, {withTheme: true})(ModalNmsConfigForm);
