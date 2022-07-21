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
import Plotly from 'plotly.js-basic-dist';
import createPlotlyComponent from 'react-plotly.js/factory';
import {
  HEALTH_CODES,
  HEALTH_DEFS,
} from '@fbcnms/tg-nms/app/constants/HealthConstants';
import {NETWORK_TEST_HEALTH_COLOR_RANGE} from '@fbcnms/tg-nms/app/constants/LayerConstants';

import type {HealthExecutionType} from '@fbcnms/tg-nms/app/features/network_test/NetworkTestTypes';

const Plot = createPlotlyComponent(Plotly);

const HEALTH_AXIS = [
  HEALTH_DEFS[HEALTH_CODES.EXCELLENT].name,
  HEALTH_DEFS[HEALTH_CODES.GOOD].name,
  HEALTH_DEFS[HEALTH_CODES.MARGINAL].name,
  HEALTH_DEFS[HEALTH_CODES.POOR].name,
  HEALTH_DEFS[HEALTH_CODES.MISSING].name,
];

type Props = {|
  healthExecutions: Array<HealthExecutionType>,
  className?: string,
|};

export default function HealthHistogram({
  healthExecutions,
  className = '',
}: Props) {
  /**
   * testResults is an array of pairs of test results(one for each direction).
   * flatten it to get each test result
   */
  const totalLinks = healthExecutions.reduce(
    (totalLinks, res) => totalLinks + res.executions.length,
    0,
  );

  const counts = healthExecutions
    .sort((a, b) => a.health - b.health)
    .map(healthExecution => healthExecution.executions.length);

  return (
    <Plot
      className={className}
      data={[
        {
          type: 'bar',
          x: HEALTH_AXIS,
          y: counts,
          marker: {
            color: NETWORK_TEST_HEALTH_COLOR_RANGE,
          },
        },
      ]}
      config={{
        displaylogo: false,
        displayModeBar: false,
      }}
      useResizeHandler={true}
      layout={{
        autosize: true,
        margin: {
          l: 25,
          r: 25,
          t: 25,
        },
        yaxis: {
          range: [0, totalLinks === 0 ? 1 : totalLinks],
        },
        bargap: 0,
      }}
    />
  );
}
