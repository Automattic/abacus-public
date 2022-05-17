import Fixtures from 'src/test-helpers/fixtures'

import * as Recommendations from './recommendations'
import { AnalysisStrategy, Status } from './schemas'

describe('getDiffCredibleIntervalStats', () => {
  it('should return null for missing analysis', () => {
    expect(Recommendations.getDiffCredibleIntervalStats(null, Fixtures.createMetricAssignment({}), '2_1')).toBe(null)
    expect(
      Recommendations.getDiffCredibleIntervalStats(
        Fixtures.createAnalysisNext({ metricEstimates: null }),
        Fixtures.createMetricAssignment({}),
        '2_1',
      ),
    ).toBe(null)
  })

  it('should throw for bottom greater than top', () => {
    expect(() =>
      Recommendations.getDiffCredibleIntervalStats(
        Fixtures.createAnalysisNext({
          metricEstimates: Fixtures.createMetricEstimatesNext({
            diffs: {
              '2_1': Fixtures.createDistributionStats({
                mean: 0,
                top_95: 0,
                bottom_95: 10,
              }),
            },
          }),
        }),
        Fixtures.createMetricAssignment({
          minDifference: 10,
        }),
        '2_1',
      ),
    ).toThrowErrorMatchingInlineSnapshot(`"Invalid metricEstimates: bottom greater than top."`)
  })

  it('should return correct stats', () => {
    expect(
      Recommendations.getDiffCredibleIntervalStats(
        Fixtures.createAnalysisNext({
          metricEstimates: Fixtures.createMetricEstimatesNext({
            diffs: {
              '2_1': Fixtures.createDistributionStats({
                mean: 0,
                top_95: 0,
                bottom_95: 0,
              }),
            },
          }),
        }),
        Fixtures.createMetricAssignment({
          minDifference: 10,
        }),
        '2_1',
      ),
    ).toEqual({
      practicallySignificant: Recommendations.PracticalSignificanceStatus.No,
      statisticallySignificant: false,
      isPositive: false,
    })
    expect(
      Recommendations.getDiffCredibleIntervalStats(
        Fixtures.createAnalysisNext({
          metricEstimates: Fixtures.createMetricEstimatesNext({
            diffs: {
              '2_1': Fixtures.createDistributionStats({
                mean: 0,
                top_95: 10,
                bottom_95: 0,
              }),
            },
          }),
        }),
        Fixtures.createMetricAssignment({
          minDifference: 10,
        }),
        '2_1',
      ),
    ).toEqual({
      practicallySignificant: Recommendations.PracticalSignificanceStatus.No,
      statisticallySignificant: false,
      isPositive: false,
    })
    expect(
      Recommendations.getDiffCredibleIntervalStats(
        Fixtures.createAnalysisNext({
          metricEstimates: Fixtures.createMetricEstimatesNext({
            diffs: {
              '2_1': Fixtures.createDistributionStats({
                mean: 0,
                top_95: 1,
                bottom_95: -1,
              }),
            },
          }),
        }),
        Fixtures.createMetricAssignment({
          minDifference: 10,
        }),
        '2_1',
      ),
    ).toEqual({
      practicallySignificant: Recommendations.PracticalSignificanceStatus.No,
      statisticallySignificant: false,
      isPositive: false,
    })
    expect(
      Recommendations.getDiffCredibleIntervalStats(
        Fixtures.createAnalysisNext({
          metricEstimates: Fixtures.createMetricEstimatesNext({
            diffs: {
              '2_1': Fixtures.createDistributionStats({
                mean: 0,
                top_95: -1,
                bottom_95: -2,
              }),
            },
          }),
        }),
        Fixtures.createMetricAssignment({
          minDifference: 10,
        }),
        '2_1',
      ),
    ).toEqual({
      practicallySignificant: Recommendations.PracticalSignificanceStatus.No,
      statisticallySignificant: true,
      isPositive: false,
    })
    expect(
      Recommendations.getDiffCredibleIntervalStats(
        Fixtures.createAnalysisNext({
          metricEstimates: Fixtures.createMetricEstimatesNext({
            diffs: {
              '2_1': Fixtures.createDistributionStats({
                mean: 0,
                top_95: 2,
                bottom_95: 1,
              }),
            },
          }),
        }),
        Fixtures.createMetricAssignment({
          minDifference: 10,
        }),
        '2_1',
      ),
    ).toEqual({
      practicallySignificant: Recommendations.PracticalSignificanceStatus.No,
      statisticallySignificant: true,
      isPositive: true,
    })
    expect(
      Recommendations.getDiffCredibleIntervalStats(
        Fixtures.createAnalysisNext({
          metricEstimates: Fixtures.createMetricEstimatesNext({
            diffs: {
              '2_1': Fixtures.createDistributionStats({
                mean: 0,
                top_95: -1,
                bottom_95: -20,
              }),
            },
          }),
        }),
        Fixtures.createMetricAssignment({
          minDifference: 10,
        }),
        '2_1',
      ),
    ).toEqual({
      practicallySignificant: Recommendations.PracticalSignificanceStatus.Uncertain,
      statisticallySignificant: true,
      isPositive: false,
    })
    expect(
      Recommendations.getDiffCredibleIntervalStats(
        Fixtures.createAnalysisNext({
          metricEstimates: Fixtures.createMetricEstimatesNext({
            diffs: {
              '2_1': Fixtures.createDistributionStats({
                mean: 0,
                top_95: 20,
                bottom_95: 1,
              }),
            },
          }),
        }),
        Fixtures.createMetricAssignment({
          minDifference: 10,
        }),
        '2_1',
      ),
    ).toEqual({
      practicallySignificant: Recommendations.PracticalSignificanceStatus.Uncertain,
      statisticallySignificant: true,
      isPositive: true,
    })
    expect(
      Recommendations.getDiffCredibleIntervalStats(
        Fixtures.createAnalysisNext({
          metricEstimates: Fixtures.createMetricEstimatesNext({
            diffs: {
              '2_1': Fixtures.createDistributionStats({
                mean: 0,
                top_95: -10,
                bottom_95: -20,
              }),
            },
          }),
        }),
        Fixtures.createMetricAssignment({
          minDifference: 10,
        }),
        '2_1',
      ),
    ).toEqual({
      practicallySignificant: Recommendations.PracticalSignificanceStatus.Yes,
      statisticallySignificant: true,
      isPositive: false,
    })
    expect(
      Recommendations.getDiffCredibleIntervalStats(
        Fixtures.createAnalysisNext({
          metricEstimates: Fixtures.createMetricEstimatesNext({
            diffs: {
              '2_1': Fixtures.createDistributionStats({
                mean: 0,
                top_95: 20,
                bottom_95: 10,
              }),
            },
          }),
        }),
        Fixtures.createMetricAssignment({
          minDifference: 10,
        }),
        '2_1',
      ),
    ).toEqual({
      practicallySignificant: Recommendations.PracticalSignificanceStatus.Yes,
      statisticallySignificant: true,
      isPositive: true,
    })
    expect(
      Recommendations.getDiffCredibleIntervalStats(
        Fixtures.createAnalysisNext({
          metricEstimates: Fixtures.createMetricEstimatesNext({
            diffs: {
              '2_1': Fixtures.createDistributionStats({
                mean: 0,
                top_95: 15,
                bottom_95: -15,
              }),
            },
          }),
        }),
        Fixtures.createMetricAssignment({
          minDifference: 10,
        }),
        '2_1',
      ),
    ).toEqual({
      practicallySignificant: Recommendations.PracticalSignificanceStatus.Uncertain,
      statisticallySignificant: false,
      isPositive: false,
    })
  })
})

describe('getMetricAssignmentRecommendation', () => {
  it('should work correctly for single analyses', () => {
    expect(
      Recommendations.getMetricAssignmentRecommendation(
        Fixtures.createExperimentFull(),
        Fixtures.createMetric(123),
        Fixtures.createAnalysisNext({
          analysisStrategy: AnalysisStrategy.PpNaive,
          metricEstimates: Fixtures.createMetricEstimatesNext({
            diffs: {
              '2_1': Fixtures.createDistributionStats({
                top_95: 1,
                bottom_95: 0,
                mean: 0,
              }),
            },
          }),
        }),
        '2_1',
      ),
    ).toEqual({
      analysisStrategy: AnalysisStrategy.PpNaive,
      decision: Recommendations.Decision.Inconclusive,
      strongEnoughForDeployment: false,
      practicallySignificant: Recommendations.PracticalSignificanceStatus.Uncertain,
      statisticallySignificant: false,
    })

    expect(
      Recommendations.getMetricAssignmentRecommendation(
        Fixtures.createExperimentFull(),
        Fixtures.createMetric(123),
        Fixtures.createAnalysisNext({
          analysisStrategy: AnalysisStrategy.PpNaive,
          metricEstimates: Fixtures.createMetricEstimatesNext({
            diffs: {
              '2_1': Fixtures.createDistributionStats({
                top_95: 1,
                bottom_95: 0.001,
                mean: 0,
              }),
            },
          }),
        }),
        '2_1',
      ),
    ).toEqual({
      analysisStrategy: AnalysisStrategy.PpNaive,
      decision: Recommendations.Decision.VariantAhead,
      strongEnoughForDeployment: false,
      chosenVariationId: 2,
      practicallySignificant: Recommendations.PracticalSignificanceStatus.Uncertain,
      statisticallySignificant: true,
    })

    expect(
      Recommendations.getMetricAssignmentRecommendation(
        Fixtures.createExperimentFull({ status: Status.Completed }),
        Fixtures.createMetric(123),
        Fixtures.createAnalysisNext({
          analysisStrategy: AnalysisStrategy.PpNaive,
          metricEstimates: Fixtures.createMetricEstimatesNext({
            diffs: {
              '2_1': Fixtures.createDistributionStats({
                top_95: 0,
                bottom_95: 0,
                mean: 0,
              }),
            },
          }),
        }),
        '2_1',
      ),
    ).toEqual({
      analysisStrategy: AnalysisStrategy.PpNaive,
      decision: Recommendations.Decision.NoDifference,
      strongEnoughForDeployment: true,
      practicallySignificant: Recommendations.PracticalSignificanceStatus.No,
      statisticallySignificant: false,
    })

    expect(
      Recommendations.getMetricAssignmentRecommendation(
        Fixtures.createExperimentFull(),
        Fixtures.createMetric(123),
        Fixtures.createAnalysisNext({
          analysisStrategy: AnalysisStrategy.PpNaive,
          metricEstimates: Fixtures.createMetricEstimatesNext({
            diffs: {
              '2_1': Fixtures.createDistributionStats({
                top_95: 0,
                bottom_95: 0,
                mean: 0,
              }),
            },
          }),
        }),
        '2_1',
      ),
    ).toEqual({
      analysisStrategy: AnalysisStrategy.PpNaive,
      decision: Recommendations.Decision.NoDifference,
      strongEnoughForDeployment: false,
      practicallySignificant: Recommendations.PracticalSignificanceStatus.No,
      statisticallySignificant: false,
    })

    expect(
      Recommendations.getMetricAssignmentRecommendation(
        Fixtures.createExperimentFull({ status: Status.Completed }),
        Fixtures.createMetric(123),
        Fixtures.createAnalysisNext({
          analysisStrategy: AnalysisStrategy.PpNaive,
          metricEstimates: Fixtures.createMetricEstimatesNext({
            diffs: {
              '2_1': Fixtures.createDistributionStats({
                top_95: 0.009,
                bottom_95: 0.001,
                mean: 0,
              }),
            },
          }),
        }),
        '2_1',
      ),
    ).toEqual({
      analysisStrategy: AnalysisStrategy.PpNaive,
      decision: Recommendations.Decision.VariantBarelyAhead,
      strongEnoughForDeployment: true,
      chosenVariationId: 2,
      practicallySignificant: Recommendations.PracticalSignificanceStatus.No,
      statisticallySignificant: true,
    })

    expect(
      Recommendations.getMetricAssignmentRecommendation(
        Fixtures.createExperimentFull(),
        Fixtures.createMetric(123),
        Fixtures.createAnalysisNext({
          analysisStrategy: AnalysisStrategy.PpNaive,
          metricEstimates: Fixtures.createMetricEstimatesNext({
            diffs: {
              '2_1': Fixtures.createDistributionStats({
                top_95: 0.009,
                bottom_95: 0.001,
                mean: 0,
              }),
            },
          }),
        }),
        '2_1',
      ),
    ).toEqual({
      analysisStrategy: AnalysisStrategy.PpNaive,
      decision: Recommendations.Decision.VariantBarelyAhead,
      chosenVariationId: 2,
      practicallySignificant: Recommendations.PracticalSignificanceStatus.No,
      statisticallySignificant: true,
      strongEnoughForDeployment: false,
    })

    expect(
      Recommendations.getMetricAssignmentRecommendation(
        Fixtures.createExperimentFull(),
        Fixtures.createMetric(123),
        Fixtures.createAnalysisNext({
          analysisStrategy: AnalysisStrategy.PpNaive,
          metricEstimates: Fixtures.createMetricEstimatesNext({
            diffs: {
              '2_1': Fixtures.createDistributionStats({
                top_95: 2,
                bottom_95: 1,
                mean: 0,
              }),
            },
          }),
        }),
        '2_1',
      ),
    ).toEqual({
      analysisStrategy: AnalysisStrategy.PpNaive,
      decision: Recommendations.Decision.VariantWins,
      strongEnoughForDeployment: false,
      chosenVariationId: 2,
      practicallySignificant: Recommendations.PracticalSignificanceStatus.Yes,
      statisticallySignificant: true,
    })
  })

  expect(
    Recommendations.getMetricAssignmentRecommendation(
      Fixtures.createExperimentFull(),
      Fixtures.createMetric(123),
      Fixtures.createAnalysisNext({
        analysisStrategy: AnalysisStrategy.PpNaive,
        metricEstimates: null,
      }),
      '2_1',
    ),
  ).toEqual({
    analysisStrategy: AnalysisStrategy.PpNaive,
    decision: Recommendations.Decision.MissingAnalysis,
    strongEnoughForDeployment: false,
  })

  expect(
    Recommendations.getMetricAssignmentRecommendation(
      Fixtures.createExperimentFull({ status: Status.Completed }),
      Fixtures.createMetric(123, { higherIsBetter: false }),
      Fixtures.createAnalysisNext({
        analysisStrategy: AnalysisStrategy.PpNaive,
        metricEstimates: Fixtures.createMetricEstimatesNext({
          diffs: {
            '2_1': Fixtures.createDistributionStats({
              top_95: 2,
              bottom_95: 1,
              mean: 0,
            }),
          },
        }),
      }),
      '2_1',
    ),
  ).toEqual({
    analysisStrategy: AnalysisStrategy.PpNaive,
    decision: Recommendations.Decision.VariantWins,
    strongEnoughForDeployment: true,
    chosenVariationId: 1,
    practicallySignificant: Recommendations.PracticalSignificanceStatus.Yes,
    statisticallySignificant: true,
  })
})

describe('getAggregateMetricAssignmentRecommendation', () => {
  it('should work correctly for missing analyses', () => {
    expect(Recommendations.getAggregateMetricAssignmentRecommendation([], AnalysisStrategy.PpNaive)).toEqual({
      analysisStrategy: AnalysisStrategy.PpNaive,
      decision: Recommendations.Decision.MissingAnalysis,
      strongEnoughForDeployment: false,
    })

    expect(
      Recommendations.getAggregateMetricAssignmentRecommendation(
        [
          {
            analysisStrategy: AnalysisStrategy.PpNaive,
            decision: Recommendations.Decision.MissingAnalysis,
            strongEnoughForDeployment: false,
          },
        ],
        AnalysisStrategy.PpNaive,
      ),
    ).toEqual({
      analysisStrategy: AnalysisStrategy.PpNaive,
      decision: Recommendations.Decision.MissingAnalysis,
      strongEnoughForDeployment: false,
    })

    expect(
      Recommendations.getAggregateMetricAssignmentRecommendation(
        [
          {
            analysisStrategy: AnalysisStrategy.IttPure,
            decision: Recommendations.Decision.Inconclusive,
          },
        ],
        AnalysisStrategy.PpNaive,
      ),
    ).toEqual({
      analysisStrategy: AnalysisStrategy.PpNaive,
      decision: Recommendations.Decision.MissingAnalysis,
      strongEnoughForDeployment: false,
    })
  })

  it('should work correctly for multiple analyses without conflict', () => {
    expect(
      Recommendations.getAggregateMetricAssignmentRecommendation(
        [
          {
            analysisStrategy: AnalysisStrategy.PpNaive,
            decision: Recommendations.Decision.VariantWins,
            chosenVariationId: 2,
            practicallySignificant: Recommendations.PracticalSignificanceStatus.Yes,
            statisticallySignificant: true,
          },
          {
            analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
            decision: Recommendations.Decision.VariantWins,
            chosenVariationId: 2,
            practicallySignificant: Recommendations.PracticalSignificanceStatus.Yes,
            statisticallySignificant: true,
          },
        ],
        AnalysisStrategy.PpNaive,
      ),
    ).toEqual({
      analysisStrategy: AnalysisStrategy.PpNaive,
      decision: Recommendations.Decision.VariantWins,
      chosenVariationId: 2,
      practicallySignificant: Recommendations.PracticalSignificanceStatus.Yes,
      statisticallySignificant: true,
    })

    expect(
      Recommendations.getAggregateMetricAssignmentRecommendation(
        [
          {
            analysisStrategy: AnalysisStrategy.PpNaive,
            decision: Recommendations.Decision.VariantWins,
            chosenVariationId: 2,
            practicallySignificant: Recommendations.PracticalSignificanceStatus.Yes,
            statisticallySignificant: true,
          },
          {
            analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
            decision: Recommendations.Decision.MissingAnalysis,
          },
        ],
        AnalysisStrategy.PpNaive,
      ),
    ).toEqual({
      analysisStrategy: AnalysisStrategy.PpNaive,
      decision: Recommendations.Decision.VariantWins,
      chosenVariationId: 2,
      practicallySignificant: Recommendations.PracticalSignificanceStatus.Yes,
      statisticallySignificant: true,
    })

    expect(
      Recommendations.getAggregateMetricAssignmentRecommendation(
        [
          {
            analysisStrategy: AnalysisStrategy.PpNaive,
            decision: Recommendations.Decision.NoDifference,
            practicallySignificant: Recommendations.PracticalSignificanceStatus.No,
            statisticallySignificant: false,
          },
          {
            analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
            decision: Recommendations.Decision.MissingAnalysis,
          },
        ],
        AnalysisStrategy.PpNaive,
      ),
    ).toEqual({
      analysisStrategy: AnalysisStrategy.PpNaive,
      decision: Recommendations.Decision.NoDifference,
      practicallySignificant: Recommendations.PracticalSignificanceStatus.No,
      statisticallySignificant: false,
    })

    expect(
      Recommendations.getAggregateMetricAssignmentRecommendation(
        [
          {
            analysisStrategy: AnalysisStrategy.PpNaive,
            decision: Recommendations.Decision.Inconclusive,
            practicallySignificant: Recommendations.PracticalSignificanceStatus.Uncertain,
            statisticallySignificant: false,
          },
          {
            analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
            decision: Recommendations.Decision.Inconclusive,
            practicallySignificant: Recommendations.PracticalSignificanceStatus.Uncertain,
            statisticallySignificant: false,
          },
        ],
        AnalysisStrategy.PpNaive,
      ),
    ).toEqual({
      analysisStrategy: AnalysisStrategy.PpNaive,
      decision: Recommendations.Decision.Inconclusive,
      practicallySignificant: Recommendations.PracticalSignificanceStatus.Uncertain,
      statisticallySignificant: false,
    })
    expect(
      Recommendations.getAggregateMetricAssignmentRecommendation(
        [
          {
            analysisStrategy: AnalysisStrategy.PpNaive,
            decision: Recommendations.Decision.MissingAnalysis,
          },
          {
            analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
            decision: Recommendations.Decision.Inconclusive,
            practicallySignificant: Recommendations.PracticalSignificanceStatus.Uncertain,
            statisticallySignificant: false,
          },
        ],
        AnalysisStrategy.PpNaive,
      ),
    ).toEqual({
      analysisStrategy: AnalysisStrategy.PpNaive,
      decision: Recommendations.Decision.MissingAnalysis,
    })
  })
  it('should work correctly for multiple analyses with conflict', () => {
    expect(
      Recommendations.getAggregateMetricAssignmentRecommendation(
        [
          {
            analysisStrategy: AnalysisStrategy.PpNaive,
            decision: Recommendations.Decision.VariantWins,
            chosenVariationId: 2,
            practicallySignificant: Recommendations.PracticalSignificanceStatus.Yes,
            statisticallySignificant: true,
          },
          {
            analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
            decision: Recommendations.Decision.VariantWins,
            chosenVariationId: 1,
            practicallySignificant: Recommendations.PracticalSignificanceStatus.Yes,
            statisticallySignificant: true,
          },
        ],
        AnalysisStrategy.PpNaive,
      ),
    ).toEqual({
      analysisStrategy: AnalysisStrategy.PpNaive,
      decision: Recommendations.Decision.ManualAnalysisRequired,
      practicallySignificant: Recommendations.PracticalSignificanceStatus.Yes,
      statisticallySignificant: true,
    })

    expect(
      Recommendations.getAggregateMetricAssignmentRecommendation(
        [
          {
            analysisStrategy: AnalysisStrategy.PpNaive,
            decision: Recommendations.Decision.VariantWins,
            chosenVariationId: 2,
            practicallySignificant: Recommendations.PracticalSignificanceStatus.Yes,
            statisticallySignificant: true,
          },
          {
            analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
            decision: Recommendations.Decision.NoDifference,
            practicallySignificant: Recommendations.PracticalSignificanceStatus.No,
            statisticallySignificant: false,
          },
        ],
        AnalysisStrategy.PpNaive,
      ),
    ).toEqual({
      analysisStrategy: AnalysisStrategy.PpNaive,
      decision: Recommendations.Decision.VariantWins,
      chosenVariationId: 2,
      practicallySignificant: Recommendations.PracticalSignificanceStatus.Yes,
      statisticallySignificant: true,
    })

    expect(
      Recommendations.getAggregateMetricAssignmentRecommendation(
        [
          {
            analysisStrategy: AnalysisStrategy.PpNaive,
            decision: Recommendations.Decision.VariantWins,
            chosenVariationId: 2,
            practicallySignificant: Recommendations.PracticalSignificanceStatus.Yes,
            statisticallySignificant: true,
          },
          {
            analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
            decision: Recommendations.Decision.VariantWins,
            chosenVariationId: 1,
            practicallySignificant: Recommendations.PracticalSignificanceStatus.Yes,
            statisticallySignificant: true,
          },
          {
            analysisStrategy: AnalysisStrategy.IttPure,
            decision: Recommendations.Decision.Inconclusive,
            practicallySignificant: Recommendations.PracticalSignificanceStatus.Uncertain,
            statisticallySignificant: false,
          },
          {
            analysisStrategy: AnalysisStrategy.MittNoCrossovers,
            decision: Recommendations.Decision.MissingAnalysis,
          },
        ],
        AnalysisStrategy.PpNaive,
      ),
    ).toEqual({
      analysisStrategy: AnalysisStrategy.PpNaive,
      decision: Recommendations.Decision.ManualAnalysisRequired,
      practicallySignificant: Recommendations.PracticalSignificanceStatus.Yes,
      statisticallySignificant: true,
    })
  })
})

describe('isDataStrongEnough', () => {
  it('should work correctly for missing metricEstimates', () => {
    expect(
      Recommendations.isDataStrongEnough(
        Fixtures.createAnalysisNext({ metricEstimates: null }),
        Recommendations.Decision.MissingAnalysis,
        Fixtures.createExperimentFull(),
        Fixtures.createMetricAssignment({}),
        '2_1',
      ),
    ).toEqual(false)
  })
})
