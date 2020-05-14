/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * @format
 * @flow
 */

import * as React from 'react';
import CustomTable from '../../components/common/CustomTable';
import FriendlyText from '../../components/common/FriendlyText';
import Grid from '@material-ui/core/Grid';
import LoadingBox from '../../components/common/LoadingBox';
import Paper from '@material-ui/core/Paper';
import TableOptions from './TableOptions';
import {EXECUTION, NETWORK_TEST_TYPES} from '../../constants/ScheduleConstants';
import {makeStyles} from '@material-ui/styles';

import type {CreateTestUrl} from '../../views/network_test/NetworkTestTypes';
import type {FilterOptionsType} from '../../../shared/dto/NetworkTestTypes';
import type {RouterHistory} from 'react-router-dom';
import type {ScheduleTableRow} from './SchedulerTypes';

type Props = {
  schedulerModal: React.Node,
  createURL: CreateTestUrl,
  selectedExecutionId?: ?string,
  history: RouterHistory,
  rows: Array<ScheduleTableRow>,
  loading: boolean,
  filterOptions: FilterOptionsType,
  handleFilterOptions: FilterOptionsType => void,
};

const useStyles = makeStyles(theme => ({
  schedule: {
    padding: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  header: {
    flexGrow: 0,
    flexShrink: 0,
  },
  executionsTableWrapper: {
    overflow: 'auto',
    flexGrow: '1',
    paddingBottom: theme.spacing(2),
  },
  scheduleModal: {
    float: 'right',
    padding: theme.spacing(2),
  },
  loadingBox: {
    top: '5%',
    left: '50%',
  },
}));

export default function ScheduleTable(props: Props) {
  const classes = useStyles();
  const {
    schedulerModal,
    selectedExecutionId,
    history,
    createURL,
    rows,
    loading,
    filterOptions,
    handleFilterOptions,
  } = props;

  const [selectedRow, setSelectedRow] = React.useState(null);

  React.useEffect(() => {
    if (selectedExecutionId) {
      setSelectedRow(
        rows?.find(
          row =>
            row.id === selectedExecutionId &&
            row.filterStatus === EXECUTION.COMPLETED,
        ),
      );
    }
    if (
      selectedRow &&
      selectedRow?.id &&
      selectedRow.filterStatus === EXECUTION.COMPLETED
    ) {
      history.push(
        createURL({
          executionId: selectedRow.id.toString(),
        }),
      );
    }
  }, [createURL, history, rows, selectedExecutionId, selectedRow]);

  const tableProps = React.useMemo(() => {
    const tableDimensions = {
      rowHeight: 60,
      headerHeight: 40,
      overscanRowCount: 10,
    };

    const columns = [
      scheduleColumn('type', {width: 100}),
      scheduleColumn('start', {width: 190}),
      scheduleColumn('status', {width: 190}),
      scheduleColumn('protocol', {width: 60}),
      scheduleColumn('actions', {width: 150}),
    ];

    const filteredRows = rows?.filter(row => {
      const correctProtocol =
        !filterOptions?.protocol || filterOptions?.protocol === row.protocol;
      const correctDate =
        row.filterStatus === 'SCHEDULED' ||
        !filterOptions?.startTime ||
        new Date(row.start).getTime() >
          new Date(filterOptions?.startTime || '').getTime();
      const correctType =
        !filterOptions?.testType ||
        NETWORK_TEST_TYPES[filterOptions?.testType] === row.type;
      const correctStatus =
        !filterOptions?.status || filterOptions?.status === row.filterStatus;
      return correctProtocol && correctDate && correctType && correctStatus;
    });

    return {
      ...tableDimensions,
      columns,
      data: filteredRows,
    };
  }, [rows, filterOptions]);

  const handleRowSelect = React.useCallback(
    row => {
      setSelectedRow(row);
    },
    [setSelectedRow],
  );

  return (
    <Grid item xs={12}>
      <Paper className={classes.schedule} elevation={2}>
        <Grid container item className={classes.header}>
          <Grid item xs={8}>
            <TableOptions onOptionsUpdate={handleFilterOptions} />
          </Grid>
          <Grid item xs={4}>
            <div className={classes.scheduleModal}>{schedulerModal}</div>
          </Grid>
        </Grid>
        <Grid
          container
          item
          className={classes.executionsTableWrapper}
          justify="center">
          {loading ? (
            <LoadingBox className={classes.loadingBox} fullScreen={false} />
          ) : !rows ? (
            'Failed to load, please try again.'
          ) : tableProps.data?.length ? (
            <CustomTable {...tableProps} onRowSelect={handleRowSelect} />
          ) : (
            'No executions or schedules with current filters, try starting a test.'
          )}
        </Grid>
      </Paper>
    </Grid>
  );
}

function scheduleColumn(name: string, overrides: Object = {}) {
  return {
    key: name,
    label: (
      <FriendlyText
        text={name}
        disableTypography
        separator="_"
        stripPrefix="cron"
      />
    ),
    width: 100,
    ...overrides,
  };
}
