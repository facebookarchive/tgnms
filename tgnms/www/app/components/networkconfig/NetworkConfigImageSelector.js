/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 */
'use strict';

import {
  changeEditMode,
  selectImage,
} from '../../actions/NetworkConfigActions.js';
import {CONFIG_VIEW_MODE} from '../../constants/NetworkConfigConstants.js';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {render} from 'react-dom';
import Select from 'react-select';
import React from 'react';

export default class NetworkConfigImageSelector extends React.Component {
  constructor(props) {
    super(props);
  }

  selectImage(val) {
    selectImage({
      image: val.value,
    });
  }

  renderBaseVersionSelector(imageVersions, selectedImage) {
    const selectOptions = imageVersions.map(image => {
      return {
        label: image,
        value: image,
      };
    });

    return (
      <Select
        name="Select Base Version"
        value={selectedImage}
        options={selectOptions}
        onChange={this.selectImage}
        clearable={false}
      />
    );
  }

  render() {
    const {imageVersions, selectedImage} = this.props;
    return this.renderBaseVersionSelector(imageVersions, selectedImage);
  }
}

NetworkConfigImageSelector.propTypes = {
  selectedImage: PropTypes.string.isRequired,
  imageVersions: PropTypes.array.isRequired,
};
