import { createStyles, makeStyles, Theme, Tooltip } from '@material-ui/core'
import clsx from 'clsx'
import React from 'react'

import MetricValue, { metricValueFormatData } from 'src/components/general/MetricValue'
import { UnitInfo } from 'src/lib/explat/metrics'
import { useDecorationStyles } from 'src/styles/styles'
import { NumberToString } from 'src/utils/formatters'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    metricValueIntervalCentered: {
      display: 'flex',
      '& > span': {
        flex: 1,
        textAlign: 'left',
        '&:first-child': {
          textAlign: 'right',
          marginRight: theme.spacing(1),
        },
        '&:last-child': {
          marginLeft: theme.spacing(1),
        },
      },
    },
    metricValueWrapper: {
      whiteSpace: 'nowrap',
    },
  }),
)

/**
 * Displays a metric value interval.
 */
export default function MetricValueInterval({
  intervalName,
  bottomValue,
  topValue,
  unit,
  formatter,
  displayTooltipHint = true,
  displayPositiveSign = true,
  alignToCenter,
  ciPercent = 95,
  className,
}: {
  intervalName: string
  bottomValue: number
  topValue: number
  unit: UnitInfo
  formatter?: NumberToString
  displayTooltipHint?: boolean
  displayPositiveSign?: boolean
  alignToCenter?: boolean
  ciPercent?: number
  className?: string
}): JSX.Element {
  const classes = useStyles()
  const decorationClasses = useDecorationStyles()
  const metricValueFormat = metricValueFormatData[unit.unitType]
  return (
    <Tooltip
      title={
        <>
          <strong>Interpretation:</strong>
          <br />
          There is a {ciPercent}% probability that {intervalName} is between{' '}
          <MetricValue
            value={bottomValue}
            unit={unit}
            formatter={formatter}
            displayPositiveSign={displayPositiveSign}
          />{' '}
          and{' '}
          <MetricValue value={topValue} unit={unit} formatter={formatter} displayPositiveSign={displayPositiveSign} />.
        </>
      }
    >
      <span
        aria-label={intervalName}
        className={clsx(
          displayTooltipHint && decorationClasses.tooltipped,
          alignToCenter && classes.metricValueIntervalCentered,
          className,
        )}
      >
        <span className={classes.metricValueWrapper}>
          <MetricValue
            value={bottomValue}
            unit={unit}
            formatter={formatter}
            displayUnit={false}
            displayPositiveSign={displayPositiveSign}
          />
        </span>{' '}
        to{' '}
        <span className={classes.metricValueWrapper}>
          <MetricValue
            value={topValue}
            unit={unit}
            formatter={formatter}
            displayUnit={false}
            displayPositiveSign={displayPositiveSign}
          />{' '}
          {metricValueFormat.unit}
        </span>
      </span>
    </Tooltip>
  )
}
