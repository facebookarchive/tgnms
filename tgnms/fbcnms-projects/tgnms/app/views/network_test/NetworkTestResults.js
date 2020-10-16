/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow
 */

import * as React from 'react';
import HealthGroupDropDown from '../../components/common/HealthGroupDropDown';
import HealthHistogram from './HealthHistogram';
import NetworkContext from '../../contexts/NetworkContext';
import Typography from '@material-ui/core/Typography';
import {EXECUTION_STATUS} from '../../constants/ScheduleConstants';
import {HEALTH_DEFS, HEALTH_EXECUTIONS} from '../../constants/HealthConstants';
import {TopologyElementType} from '../../constants/NetworkConstants';
import {convertType, objectValuesTypesafe} from '../../helpers/ObjectHelpers';
import {
  getExecutionHealth,
  getExecutionStatus,
} from '../../helpers/NetworkTestHelpers';
import {makeStyles} from '@material-ui/styles';

import type {AssetTestResultType} from './NetworkTestTypes';
import type {HealthRowType} from '../../components/common/HealthGroupDropDown';

type Props = {|
  executionResults: Array<AssetTestResultType>,
  assetType: $Values<typeof TopologyElementType>,
|};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  histogram: {
    width: '100%',
    height: 300,
    paddingTop: theme.spacing(1),
  },
}));

export default function NetworkTestResults(props: Props) {
  const classes = useStyles();
  const {executionResults, assetType} = props;
  const {setSelected} = React.useContext(NetworkContext);
  const executionResultsRef = React.useRef(executionResults);

  const asset = assetType === TopologyElementType.LINK ? 'link' : 'site';

  const handleRowSelect = row => {
    setSelected(assetType, row.asset_name);
  };

  const {healthExecutions, statusCount} = React.useMemo(() => {
    const healthExecutions = HEALTH_EXECUTIONS.map(health => ({
      health,
      executions: [],
    }));

    const statusCount = objectValuesTypesafe<string>(EXECUTION_STATUS).reduce(
      (res, status) => {
        res[status] = 0;
        return res;
      },
      {},
    );

    executionResultsRef.current.forEach(execution => {
      const status = getExecutionStatus(execution);
      statusCount[status] += 1;
      if (status === EXECUTION_STATUS.FINISHED) {
        const health = getExecutionHealth(execution);
        healthExecutions
          .find(healthExecution => healthExecution.health === health)
          ?.executions.push(execution);
      }
    });
    return {healthExecutions, statusCount};
  }, [executionResultsRef]);

  const unsuccessfulTestCount =
    statusCount[EXECUTION_STATUS.FAILED] +
    statusCount[EXECUTION_STATUS.ABORTED];

  return (
    executionResults && (
      <>
        <HealthHistogram
          className={classes.histogram}
          healthExecutions={healthExecutions}
        />
        {statusCount[EXECUTION_STATUS.RUNNING] !== 0 ? (
          <Typography variant="body1">
            {`${statusCount[EXECUTION_STATUS.RUNNING]} ${asset}${getPlural(
              statusCount[EXECUTION_STATUS.RUNNING],
            )} currently being tested`}
          </Typography>
        ) : null}
        <Typography variant="body1">
          {`${statusCount[EXECUTION_STATUS.FINISHED]} ${asset}${getPlural(
            statusCount[EXECUTION_STATUS.FINISHED],
          )} successfully tested`}
        </Typography>
        <Typography variant="body1" className={classes.header}>
          {`${unsuccessfulTestCount} ${asset}${getPlural(
            unsuccessfulTestCount,
          )} unsuccessfully tested`}
        </Typography>

        {healthExecutions.map(assetHealth =>
          assetHealth.executions.length ? (
            <HealthGroupDropDown
              key={HEALTH_DEFS[assetHealth.health].name}
              executions={convertType<Array<HealthRowType>>(
                assetHealth.executions,
              )}
              onRowSelect={handleRowSelect}
              dropDownText={`${
                assetHealth.executions.length
              } ${asset}${getPlural(
                assetHealth.executions.length,
              )} with ${HEALTH_DEFS[
                assetHealth.health
              ].name.toLowerCase()} health`}
              health={assetHealth.health}
            />
          ) : null,
        )}
      </>
    )
  );
}

function getPlural(count) {
  if (count !== 1) {
    return 's';
  }
  return '';
}
