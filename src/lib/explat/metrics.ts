import { Metric, MetricParameterType } from './schemas'

/**
 * Return a stringified version of the metric params object
 */
export const stringifyMetricParams = (metric: Metric): string =>
  JSON.stringify(metric.parameterType === 'conversion' ? metric.eventParams : metric.revenueParams, null, 4)

export enum UnitType {
  Proportion = 'proportion',
  RatioPoints = 'ratio_points',
  Count = 'count',
  Usd = 'usd',
}

export const MetricParameterTypeToUnitType: Record<MetricParameterType, UnitType> = {
  [MetricParameterType.Revenue]: UnitType.Usd,
  [MetricParameterType.Conversion]: UnitType.Proportion,
  [MetricParameterType.Pipe]: UnitType.Proportion,
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
