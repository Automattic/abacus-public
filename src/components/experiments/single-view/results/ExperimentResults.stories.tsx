import { ComponentMeta, ComponentStory, Story } from '@storybook/react'
import React, { ComponentProps } from 'react'

import ExperimentResults from 'src/components/experiments/single-view/results/ExperimentResults'
import { AnalysisStrategy, Status } from 'src/lib/schemas'
import Fixtures from 'src/test-helpers/fixtures'

export default {
  title: 'Experiment results',
  component: ExperimentResults,
  argTypes: {
    sampleSize: {
      control: { type: 'number', min: 0, max: 500000, step: 10000 },
      description: 'This will automatically update participantStats in every analysis',
    },
  },
  parameters: {
    controls: { include: [] },
  },
} as ComponentMeta<typeof ExperimentResults>

const defaultArgs = {
  analyses: Fixtures.createAnalyses(),
  experiment: Fixtures.createExperimentFull({
    status: Status.Completed,
    variations: [
      Fixtures.createVariation({
        variationId: 1,
        name: 'control',
        isDefault: true,
        allocatedPercentage: 50,
      }),
      Fixtures.createVariation({
        variationId: 2,
        name: 'treatment1',
        isDefault: false,
        allocatedPercentage: 50,
      }),
    ],
  }),
  metrics: Fixtures.createMetrics(),
  debugMode: false,
}

const MultiVariationTemplate: Story<ComponentProps<typeof ExperimentResults> & { sampleSize: number }> = ({
  sampleSize,
  ...args
}) => {
  const abnAnalyses = [
    Fixtures.createMultiVariationAnalysis({
      analysisStrategy: AnalysisStrategy.IttPure,
      participantStats: {
        total: sampleSize,
        variation_1: 0.395 * sampleSize,
        variation_2: 0.405 * sampleSize,
        variation_3: 0.2 * sampleSize,
      },
    }),
    Fixtures.createMultiVariationAnalysis({
      analysisStrategy: AnalysisStrategy.MittNoCrossovers,
      participantStats: {
        total: 0.96 * sampleSize,
        variation_1: 0.38 * sampleSize,
        variation_2: 0.385 * sampleSize,
        variation_3: 0.195 * sampleSize,
      },
    }),
    Fixtures.createMultiVariationAnalysis({
      analysisStrategy: AnalysisStrategy.MittNoSpammers,
      participantStats: {
        total: 0.89 * sampleSize,
        variation_1: 0.35 * sampleSize,
        variation_2: 0.35 * sampleSize,
        variation_3: 0.19 * sampleSize,
      },
    }),
    Fixtures.createMultiVariationAnalysis({
      analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
      participantStats: {
        total: 0.8 * sampleSize,
        variation_1: 0.315 * sampleSize,
        variation_2: 0.325 * sampleSize,
        variation_3: 0.16 * sampleSize,
      },
    }),
    Fixtures.createMultiVariationAnalysis({
      analysisStrategy: AnalysisStrategy.PpNaive,
      participantStats: {
        total: 0.85 * sampleSize,
        variation_1: 0.34 * sampleSize,
        variation_2: 0.345 * sampleSize,
        variation_3: 0.165 * sampleSize,
      },
    }),
  ]
  return <ExperimentResults {...args} analyses={abnAnalyses} />
}

export const MultiVariationAnalyses = MultiVariationTemplate.bind({})
MultiVariationAnalyses.args = {
  ...defaultArgs,
  sampleSize: 10000,
  experiment: Fixtures.createExperimentFull({
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
  }),
}
MultiVariationAnalyses.parameters = { controls: { include: ['sampleSize'] } }

const Template: ComponentStory<typeof ExperimentResults> = (args) => <ExperimentResults {...args} />

export const Default = Template.bind({})
Default.args = defaultArgs

export const noAnalyses = Template.bind({})
noAnalyses.args = {
  ...defaultArgs,
  analyses: [],
}

export const metricsWithLongName = Template.bind({})
metricsWithLongName.args = {
  ...defaultArgs,
  metrics: [
    ...defaultArgs.metrics,
    Fixtures.createMetric(1, { name: 'archived_metric_with_usually_an_extra_long_name_xx_xx_xxxx' }),
  ],
}

export const treatmentWinning = Template.bind({})
treatmentWinning.args = {
  ...defaultArgs,
  metrics: [
    Fixtures.createMetric(1, { higherIsBetter: true }),
    Fixtures.createMetric(2),
    Fixtures.createMetric(3),
    Fixtures.createMetric(4),
  ],
  analyses: [
    Fixtures.createAnalysis({
      analysisStrategy: AnalysisStrategy.PpNaive,
      metricEstimates: Fixtures.createMetricEstimates({
        diffs: {
          '2_1': Fixtures.createDistributionStats({
            top_95: 0.245,
            bottom_95: 0.117,
            mean: 0.125,
          }),
        },
        ratios: {
          '2_1': Fixtures.createDistributionStats({
            top_95: 4.35,
            bottom_95: 2.12,
            mean: 0,
          }),
        },
        variations: {
          '1': Fixtures.createDistributionStats({ top_95: 0.5, bottom_95: 0.1, mean: 0.25 }),
          '2': Fixtures.createDistributionStats({ top_95: 0.7, bottom_95: 0.2, mean: 0.35 }),
        },
      }),
    }),
  ],
}

export const controlBarelyAheadAnalyses = Template.bind({})
controlBarelyAheadAnalyses.args = {
  ...defaultArgs,
  analyses: [
    Fixtures.createAnalysis({
      analysisStrategy: AnalysisStrategy.PpNaive,
      metricEstimates: Fixtures.createMetricEstimates({
        diffs: {
          '2_1': Fixtures.createDistributionStats({
            top_95: 0.045,
            bottom_95: 0.007,
            mean: 0.035,
          }),
        },
        ratios: {
          '2_1': Fixtures.createDistributionStats({
            top_95: 1.05,
            bottom_95: 1.02,
            mean: 0,
          }),
        },
        variations: {
          '1': Fixtures.createDistributionStats({ top_95: 0.07, bottom_95: 0.02, mean: 0.035 }),
          '2': Fixtures.createDistributionStats({ top_95: 0.05, bottom_95: 0.01, mean: 0.025 }),
        },
      }),
    }),
  ],
}
