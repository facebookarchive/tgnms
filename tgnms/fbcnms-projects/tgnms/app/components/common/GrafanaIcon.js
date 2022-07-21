/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow
 */

import * as React from 'react';
import classNames from 'classnames';
import icon from '@fbcnms/tg-nms/static/images/grafana_icon.svg';
import {makeStyles} from '@material-ui/styles';

export type Props = {
  gray?: boolean,
};

const styles = {
  grafanaIcon: {
    height: '18px',
    margin: '2px',
  },
  gray: {
    filter: 'contrast(0) brightness(0.94)',
  },
};

const useStyles = makeStyles(() => styles);

export default function GrafanaIcon({gray}: Props) {
  const classes = useStyles();
  return (
    <img
      className={classNames(classes.grafanaIcon, gray && classes.gray)}
      data-testid="grafana-icon"
      src={icon}
    />
  );
}
