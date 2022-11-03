import { Button, Dialog, DialogTitle, Toolbar, Tooltip } from '@material-ui/core'
import Paper from '@material-ui/core/Paper'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import Typography from '@material-ui/core/Typography'
import { Add } from '@material-ui/icons'
import clsx from 'clsx'
import _ from 'lodash'
import React, { useMemo, useState } from 'react'

import MetricAssignmentForm from 'src/components/experiments/MetricAssignmentForm'
import Attribute from 'src/components/general/Attribute'
import MetricValue, { getUnitType, UnitType } from 'src/components/general/MetricValue'
import { AttributionWindowSecondsToHuman } from 'src/lib/metric-assignments'
import * as MetricAssignments from 'src/lib/metric-assignments'
import { ExperimentFull, Metric, MetricAssignment, Status } from 'src/lib/schemas'
import { formatBoolean } from 'src/utils/formatters'

/**
 * Resolves the metric ID of the metric assignment with the actual metric. If the
 * ID cannot be resolved, then an `Error` will be thrown.
 *
 * @param metricAssignments - The metric assignments to be resolved.
 * @param metrics - The metrics to associate with the assignments.
 * @throws {Error} When unable to resolve a metric ID with one of the supplied
 *   metrics.
 */
function resolveMetricAssignments(metricAssignments: MetricAssignment[], metrics: Metric[]) {
  const metricsById: { [metricId: string]: Metric } = {}
  metrics.forEach((metric) => (metricsById[metric.metricId] = metric))

  return metricAssignments.map((metricAssignment) => {
    const metric = metricsById[metricAssignment.metricId]

    if (!metric) {
      throw Error(
        `Failed to lookup metric with ID ${metricAssignment.metricId} for assignment with ID ${metricAssignment.metricAssignmentId}.`,
      )
    }

    return { ...metricAssignment, metric }
  })
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    primary: {
      color: theme.palette.grey[500],
    },
    monospace: {
      fontFamily: theme.custom.fonts.monospace,
    },
    title: {
      flexGrow: 1,
    },
    metricsTable: {
      tableLayout: 'fixed',
    },
    addMetricPlaceholder: {
      fontFamily: theme.typography.fontFamily,
    },
    smallColumn: {
      width: '10%',
    },
    metricName: {
      maxWidth: '100%',
      display: 'inline-block',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    metricAssignmentDialog: {
      minWidth: 600,
    },
  }),
)

/**
 * Renders the assigned metric information of an experiment in a panel component.
 *
 * @param experiment - The experiment with the metric assignment information.
 * @param experimentReloadRef - Trigger a reload of the experiment.
 * @param metrics - The metrics to look up (aka resolve) the metric IDs of the
 *   experiment's metric assignments.
 */
function MetricAssignmentsPanel({
  experiment,
  experimentReloadRef,
  metrics,
}: {
  experiment: ExperimentFull
  experimentReloadRef: React.MutableRefObject<() => void>
  metrics: Metric[]
}): JSX.Element {
  const classes = useStyles()
  const resolvedMetricAssignments = useMemo(
    () => resolveMetricAssignments(MetricAssignments.sort(experiment.metricAssignments), metrics),
    [experiment, metrics],
  )

  // Assign Metric Modal
  const canAssignMetric = experiment.status !== Status.Staging
  const [isAssigningMetric, setIsAssigningMetric] = useState<boolean>(false)

  const onAssignMetric = () => setIsAssigningMetric(true)
  const onCancelAssignMetric = () => {
    setIsAssigningMetric(false)
  }
  const onSuccessAssignMetric = () => {
    experimentReloadRef.current()
    setIsAssigningMetric(false)
  }

  return (
    <Paper>
      <Toolbar>
        <Typography className={classes.title} color='textPrimary' variant='h3'>
          Metrics
        </Typography>
        <Tooltip title={canAssignMetric ? '' : 'Use "Edit in Wizard" for staging experiments.'}>
          <div>
            <Button onClick={onAssignMetric} variant='outlined' disabled={!canAssignMetric}>
              <Add />
              Assign Metric
            </Button>
          </div>
        </Tooltip>
      </Toolbar>
      <Table className={classes.metricsTable}>
        <TableHead>
          <TableRow>
            <TableCell component='th' variant='head'>
              Name
            </TableCell>
            <TableCell component='th' variant='head' className={classes.smallColumn}>
              Attribution Window
            </TableCell>
            <TableCell component='th' variant='head' className={classes.smallColumn}>
              Changes Expected
            </TableCell>
            <TableCell component='th' variant='head' className={classes.smallColumn}>
              Minimum Difference
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {resolvedMetricAssignments.map((resolvedMetricAssignment) => (
            <TableRow key={resolvedMetricAssignment.metricAssignmentId}>
              <TableCell>
                <Tooltip title={resolvedMetricAssignment.metric.name}>
                  <strong className={clsx(classes.monospace, classes.metricName)}>
                    {resolvedMetricAssignment.metric.name}
                  </strong>
                </Tooltip>
                <br />
                <small className={classes.monospace}>{resolvedMetricAssignment.metric.description}</small>
                <br />
                {resolvedMetricAssignment.isPrimary && <Attribute name='primary' />}
              </TableCell>
              <TableCell className={classes.monospace}>
                {AttributionWindowSecondsToHuman[resolvedMetricAssignment.attributionWindowSeconds]}
              </TableCell>
              <TableCell className={classes.monospace}>
                {formatBoolean(resolvedMetricAssignment.changeExpected)}
              </TableCell>
              <TableCell className={classes.monospace}>
                <MetricValue
                  value={resolvedMetricAssignment.minDifference}
                  unit={getUnitType(resolvedMetricAssignment.metric.parameterType, UnitType.RatioPoints)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog
        maxWidth='md'
        open={isAssigningMetric}
        aria-labelledby='assign-metric-form-dialog-title'
        PaperProps={{ className: classes.metricAssignmentDialog }}
      >
        <DialogTitle id='assign-metric-form-dialog-title'>Assign Metric</DialogTitle>
        <MetricAssignmentForm
          experiment={experiment}
          metrics={metrics}
          onSuccess={onSuccessAssignMetric}
          onCancel={onCancelAssignMetric}
        />
      </Dialog>
    </Paper>
  )
}

export default MetricAssignmentsPanel
