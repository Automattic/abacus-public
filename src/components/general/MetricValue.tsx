import { Tooltip } from '@material-ui/core'
import clsx from 'clsx'
import _, { identity } from 'lodash'
import React from 'react'

import { MetricParameterType } from 'src/lib/schemas'
import { useDecorationStyles } from 'src/styles/styles'
import {
  localizeNumber,
  localizeNumberToFixedDecimals,
  NumberToString,
  standardNumberFormatter,
} from 'src/utils/formatters'

function DashedTooltip(props: Parameters<typeof Tooltip>[0]) {
  const decorationClasses = useDecorationStyles()
  return <Tooltip className={clsx(decorationClasses.tooltipped, props.className)} {...props} />
}

interface MetricValueFormat {
  unit: React.ReactNode
  prefix: React.ReactNode
  postfix: React.ReactNode
  transform: (n: number) => number
  formatter: NumberToString
}

export enum UnitType {
  Proportion = 'proportion',
  RatioPoints = 'ratio_points',
  Count = 'count',
  Usd = 'usd',
}

export const MetricParameterTypeToUnitType: Record<MetricParameterType, UnitType> = {
  [MetricParameterType.Revenue]: UnitType.Usd,
  [MetricParameterType.Conversion]: UnitType.Proportion,
}

/**
 * MetricParameterType mapped to unit type
 */
export function getUnitType(metricParameterType: MetricParameterType, unitType?: UnitType): UnitType {
  // if metricParameterType is 'Revenue', we are ignoring the explicitly set unitType
  if (metricParameterType === MetricParameterType.Revenue || !unitType) {
    return MetricParameterTypeToUnitType[metricParameterType]
  }

  return unitType
}

/**
 * Metric Formatting Data
 */
export const metricValueFormatData: Record<UnitType, MetricValueFormat> = {
  [UnitType.Proportion]: {
    unit: '%',
    prefix: '',
    postfix: '%',
    transform: (x: number): number => x * 100,
    formatter: standardNumberFormatter,
  },
  [UnitType.RatioPoints]: {
    unit: 'pp',
    prefix: '',
    postfix: (
      <DashedTooltip title='Percentage points.'>
        <span>pp</span>
      </DashedTooltip>
    ),
    transform: (x: number): number => x * 100,
    formatter: standardNumberFormatter,
  },
  [UnitType.Count]: {
    unit: 'conversions',
    prefix: '',
    postfix: ' conversions',
    transform: identity,
    formatter: localizeNumber,
  },
  [UnitType.Usd]: {
    unit: 'USD',
    prefix: '',
    postfix: <>&nbsp;USD</>,
    transform: identity,
    formatter: localizeNumberToFixedDecimals,
  },
}

/**
 * Format a metric value to be used outside of a graph context.
 * @param value The metric value
 * @param unit The unit type
 * @param isDifference Is this an arithmetic difference between metric values
 * @param displayUnit Display the unit
 * @param displayPositiveSign Display the positive sign (+) when a value is positive.
 */
export default function MetricValue({
  value,
  unit,
  displayUnit = true,
  displayPositiveSign = false,
  formatter,
}: {
  value: number
  unit: UnitType
  displayUnit?: boolean
  displayPositiveSign?: boolean
  formatter?: NumberToString
}): JSX.Element {
  const format = metricValueFormatData[unit]
  return (
    <>
      {displayPositiveSign && 0 <= value && '+'}
      {displayUnit && format.prefix}
      {formatter ? formatter(format.transform(value)) : format.formatter(format.transform(value))}
      {displayUnit && format.postfix}
    </>
  )
}
