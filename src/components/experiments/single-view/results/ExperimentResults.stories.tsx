import React from 'react'

import ExperimentResults from 'src/components/experiments/single-view/results/ExperimentResults'
import { AnalysisStrategy } from 'src/lib/schemas'
import Fixtures from 'src/test-helpers/fixtures'

export default { title: 'Experiment results' }

const analyses = Fixtures.createAnalyses()
const experiment = Fixtures.createExperimentFull()
const metrics = Fixtures.createMetrics()

export const noAnalyses = (): JSX.Element => (
  <ExperimentResults analyses={[]} experiment={experiment} metrics={metrics} />
)
export const someAnalyses = (): JSX.Element => (
  <ExperimentResults analyses={analyses} experiment={experiment} metrics={metrics} />
)
export const someAnalysesDebugMode = (): JSX.Element => (
  <ExperimentResults analyses={analyses} experiment={experiment} metrics={metrics} debugMode={true} />
)

const metricsWithLongName = [
  ...metrics,
  Fixtures.createMetric(1, { name: 'archived_metric_with_usually_an_extra_long_name_xx_xx_xxxx' }),
]
export const someAnalysesWithLongMetricName = (): JSX.Element => (
  <ExperimentResults analyses={analyses} experiment={experiment} metrics={metricsWithLongName} />
)

const abnExperiment = Fixtures.createExperimentFull({
  variations: [
    Fixtures.createVariation({
      variationId: 1,
      name: 'control',
      isDefault: true,
      allocatedPercentage: 40,
    }),
    Fixtures.createVariation({
      variationId: 2,
      name: 'treatment1',
      isDefault: false,
      allocatedPercentage: 40,
    }),
    Fixtures.createVariation({
      variationId: 3,
      name: 'treatment2',
      isDefault: false,
      allocatedPercentage: 20,
    }),
  ],
})
const abnAnalyses = [
  Fixtures.createAnalysis({
    analysisStrategy: AnalysisStrategy.PpNaive,
    metricEstimates: {
      variations: {
        '1': Fixtures.createDistributionStats({
          top_95: 1,
          bottom_95: 0.5,
          mean: 1,
        }),
        '2': Fixtures.createDistributionStats({
          top_95: 1,
          bottom_95: 0.5,
          mean: 1,
        }),
        '3': Fixtures.createDistributionStats({
          top_95: 1,
          bottom_95: 0.5,
          mean: 1,
        }),
      },
      diffs: {
        '2_1': Fixtures.createDistributionStats({
          top_95: 1,
          bottom_95: -1,
          mean: 0,
        }),
        '1_2': Fixtures.createDistributionStats({
          top_95: 0,
          bottom_95: 0,
          mean: 0,
        }),
        '3_1': Fixtures.createDistributionStats({
          top_95: 1,
          bottom_95: -1,
          mean: 0,
        }),
        '1_3': Fixtures.createDistributionStats({
          top_95: 0,
          bottom_95: 0,
          mean: 0,
        }),
        '3_2': Fixtures.createDistributionStats({
          top_95: 1,
          bottom_95: -1,
          mean: 0,
        }),
        '2_3': Fixtures.createDistributionStats({
          top_95: 0,
          bottom_95: 0,
          mean: 0,
        }),
      },
      ratios: {
        '2_1': Fixtures.createDistributionStats({
          top_95: 1,
          bottom_95: 0.5,
          mean: 0,
        }),
        '1_2': Fixtures.createDistributionStats({
          top_95: 0,
          bottom_95: 0,
          mean: 0,
        }),
        '3_1': Fixtures.createDistributionStats({
          top_95: 1,
          bottom_95: 0.5,
          mean: 0,
        }),
        '1_3': Fixtures.createDistributionStats({
          top_95: 0,
          bottom_95: 0,
          mean: 0,
        }),
        '3_2': Fixtures.createDistributionStats({
          top_95: 1,
          bottom_95: 0.5,
          mean: 0,
        }),
        '2_3': Fixtures.createDistributionStats({
          top_95: 0,
          bottom_95: 0,
          mean: 0,
        }),
      },
    },
    participantStats: {
      total: 1000,
      variation_1: 400,
      variation_2: 400,
      variation_3: 200,
    },
  }),
]
export const abnExperimentAnalyses = (): JSX.Element => (
  <ExperimentResults analyses={abnAnalyses} experiment={abnExperiment} metrics={metrics} />
)
