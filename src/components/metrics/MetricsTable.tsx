import {
  createStyles,
  LinearProgress,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Theme,
  useTheme,
} from '@material-ui/core'
import debugFactory from 'debug'
import _ from 'lodash'
import MaterialTable from 'material-table'
import React, { useMemo } from 'react'

import MetricsApi from 'src/api/MetricsApi'
import { Metric, MetricParameterType } from 'src/lib/schemas'
import { useDataLoadingError, useDataSource } from 'src/utils/data-loading'
import { formatBoolean } from 'src/utils/formatters'
import { defaultTableOptions } from 'src/utils/material-table'

const debug = debugFactory('abacus:components/MetricsTable.tsx')

const useMetricDetailStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2, 8),
      background: theme.palette.action.hover,
    },
    headerCell: {
      fontWeight: 'bold',
      width: '9rem',
      verticalAlign: 'top',
    },
    dataCell: {
      fontFamily: theme.custom.fonts.monospace,
    },
    pre: {
      whiteSpace: 'pre',
      maxHeight: '15rem',
      overflow: 'scroll',
      padding: theme.spacing(1),
      borderWidth: 1,
      borderColor: theme.palette.divider,
      borderStyle: 'solid',
      background: '#fff',
    },
  }),
)

const stringifyMetricParams = (metric: Metric): string =>
  JSON.stringify(metric.parameterType === 'conversion' ? metric.eventParams : metric.revenueParams, null, 4)

const MetricDetail = ({ metric: metricInitial }: { metric: Metric }) => {
  const classes = useMetricDetailStyles()

  const {
    isLoading,
    data: metric,
    error,
  } = useDataSource(() => MetricsApi.findById(metricInitial.metricId), [metricInitial.metricId])
  useDataLoadingError(error)

  const isReady = !isLoading && !error

  return (
    <>
      {!isReady && <LinearProgress />}
      {isReady && metric && (
        <TableContainer className={classes.root}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className={classes.headerCell}>Higher is Better:</TableCell>
                <TableCell className={classes.dataCell}>{formatBoolean(metric.higherIsBetter)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className={classes.headerCell}>Parameters:</TableCell>
                <TableCell className={classes.dataCell}>
                  <div className={classes.pre}>{stringifyMetricParams(metric)}</div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </>
  )
}

/**
 * Renders a table of "bare" metric information.
 *
 * @param metrics An array of metrics.
 * @param onEditMetric A Callback. Setting this will show the edit action in the table.
 */
const MetricsTable = ({
  metrics,
  onEditMetric,
}: {
  metrics: Metric[]
  onEditMetric?: (metricId: number) => void
}): JSX.Element => {
  debug('MetricsTable#render')

  const processedMetrics = useMemo(
    () =>
      metrics.map((metric) => ({
        ...metric,
        stringifiedParamsForSearch: stringifyMetricParams(metric),
      })),
    [metrics],
  )

  const theme = useTheme()
  const tableColumns = [
    {
      title: 'Name',
      field: 'name',
      cellStyle: {
        fontFamily: theme.custom.fonts.monospace,
        fontWeight: theme.custom.fontWeights.monospaceBold,
        wordBreak: 'break-word',
      } as React.CSSProperties,
    },
    {
      title: 'Description',
      field: 'description',
      cellStyle: {
        fontFamily: theme.custom.fonts.monospace,
      },
    },
    {
      title: 'Parameter Type',
      field: 'parameterType',
      render: ({ parameterType }: { parameterType: MetricParameterType }) =>
        parameterType === MetricParameterType.Revenue ? 'Cash Sales' : _.capitalize(parameterType),
      cellStyle: {
        fontFamily: theme.custom.fonts.monospace,
      },
    },
    {
      field: 'stringifiedParamsForSearch',
      hidden: true,
      searchable: true,
      width: 0,
    },
  ]

  return (
    <MaterialTable
      actions={
        onEditMetric
          ? [
              {
                icon: 'edit',
                tooltip: 'Edit Metric',
                onClick: (_event, rowData) => {
                  onEditMetric((rowData as Metric).metricId)
                },
              },
            ]
          : undefined
      }
      columns={tableColumns}
      data={processedMetrics}
      onRowClick={(_event, _rowData, togglePanel) => togglePanel && togglePanel()}
      options={{
        ...defaultTableOptions,
        actionsColumnIndex: 3,
      }}
      detailPanel={(rowData) => <MetricDetail metric={rowData} />}
    />
  )
}

export default MetricsTable
