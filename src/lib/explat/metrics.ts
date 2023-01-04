import { Metric } from './schemas'

/**
 * Return a stringified version of the metric params object
 */
export const stringifyMetricParams = (metric: Metric): string =>
  JSON.stringify(metric.parameterType === 'conversion' ? metric.eventParams : metric.revenueParams, null, 4)
