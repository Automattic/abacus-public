import _ from 'lodash'
import React from 'react'

import * as MetricAssignments from 'src/lib/metric-assignments'
import { indexMetrics } from 'src/lib/normalizers'
import { AnalysisPrevious, AnalysisStrategy, ExperimentFull, Metric, MetricAssignment } from 'src/lib/schemas'

import ActualExperimentResults from './ActualExperimentResults'

export type MetricAssignmentAnalysesData = {
  metricAssignment: MetricAssignment
  metric: Metric
  analysesByStrategyDateAsc: Record<AnalysisStrategy, AnalysisPrevious[]>
}

/**
 * Main component for summarizing experiment results.
 */
export default function ExperimentResults({
  analyses,
  experiment,
  metrics,
}: {
  analyses: AnalysisPrevious[]
  experiment: ExperimentFull
  metrics: Metric[]
  debugMode?: boolean
}): JSX.Element {
  const indexedMetrics = indexMetrics(metrics)
  const analysesByMetricAssignmentId = _.groupBy(analyses, 'metricAssignmentId')
  const allMetricAssignmentAnalysesData: MetricAssignmentAnalysesData[] = MetricAssignments.sort(
    experiment.metricAssignments,
  ).map((metricAssignment) => {
    const metricAssignmentAnalyses = analysesByMetricAssignmentId[metricAssignment.metricAssignmentId] || []
    return {
      metricAssignment,
      metric: indexedMetrics[metricAssignment.metricId],
      analysesByStrategyDateAsc: _.groupBy(
        _.orderBy(metricAssignmentAnalyses, ['analysisDatetime'], ['asc']),
        'analysisStrategy',
      ) as Record<AnalysisStrategy, AnalysisPrevious[]>,
    }
  })

  return (
    <div className='analysis-latest-results'>
      <ActualExperimentResults
        experiment={experiment}
        allMetricAssignmentAnalysesData={allMetricAssignmentAnalysesData}
      />
    </div>
  )
}
