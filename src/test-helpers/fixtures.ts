/**
 * Data fixtures to use in tests.
 *
 * Functions in this file return new objects populated with dummy values, which may potentially be overridden in
 * functions that accept Partial<T> as an argument.
 */
import _ from 'lodash'

import {
  AnalysisNext,
  AnalysisPrevious,
  AnalysisStrategy,
  AssignmentCacheStatus,
  AttributionWindowSeconds,
  DistributionStats,
  ExperimentFull,
  ExperimentFullNew,
  Metric,
  MetricAssignment,
  MetricEstimatesNext,
  MetricParameterType,
  Platform,
  Segment,
  SegmentAssignment,
  SegmentType,
  Status,
  TagBare,
  TransactionTypes,
  Variation,
} from 'src/lib/schemas'

function createDistributionStats(fieldOverrides?: Partial<DistributionStats>): DistributionStats {
  return {
    mean: 0,
    top_95: 0,
    bottom_95: 0,
    top_99: 0,
    bottom_99: 0,
    top_50: 0,
    bottom_50: 0,
    ...fieldOverrides,
  }
}

function createMetricEstimatesNext(fieldOverrides?: Partial<MetricEstimatesNext>): MetricEstimatesNext {
  return {
    variations: {
      '1': createDistributionStats(),
      '2': createDistributionStats(),
    },
    diffs: {
      '1_2': createDistributionStats(),
      '2_1': createDistributionStats(),
    },
    ratios: {
      '1_2': createDistributionStats(),
      '2_1': createDistributionStats(),
    },
    ...fieldOverrides,
  }
}

function createAnalysisNext(fieldOverrides: Partial<AnalysisNext>): AnalysisNext {
  return {
    metricAssignmentId: 123,
    analysisStrategy: AnalysisStrategy.IttPure,
    participantStats: {
      total: 1000,
      variation_1: 600,
      variation_2: 400,
    },
    metricEstimates: createMetricEstimatesNext(),
    analysisDatetime: new Date(Date.UTC(2020, 4, 10)),
    ...fieldOverrides,
  }
}

function createAnalysesNext(): AnalysisNext[] {
  return [
    // Full set of "latest" analyses for the default metric assignment.
    createAnalysisNext({
      analysisStrategy: AnalysisStrategy.IttPure,
      participantStats: {
        total: 1000,
        variation_1: 600,
        variation_2: 400,
      },
    }),
    createAnalysisNext({
      analysisStrategy: AnalysisStrategy.MittNoCrossovers,
      participantStats: {
        total: 900,
        variation_1: 540,
        variation_2: 360,
      },
    }),
    createAnalysisNext({
      analysisStrategy: AnalysisStrategy.MittNoSpammers,
      participantStats: {
        total: 850,
        variation_1: 510,
        variation_2: 340,
      },
    }),
    createAnalysisNext({
      analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
      participantStats: {
        total: 800,
        variation_1: 480,
        variation_2: 320,
      },
    }),
    createAnalysisNext({
      analysisStrategy: AnalysisStrategy.PpNaive,
      participantStats: {
        total: 700,
        variation_1: 420,
        variation_2: 280,
      },
    }),

    // Another set of analyses for the default metric assignment with an earlier date.
    createAnalysisNext({
      analysisStrategy: AnalysisStrategy.IttPure,
      participantStats: {
        total: 100,
        variation_1: 60,
        variation_2: 40,
      },
      analysisDatetime: new Date(Date.UTC(2020, 4, 9)),
    }),
    createAnalysisNext({
      analysisStrategy: AnalysisStrategy.MittNoCrossovers,
      participantStats: {
        total: 90,
        variation_1: 54,
        variation_2: 36,
      },
      analysisDatetime: new Date(Date.UTC(2020, 4, 9)),
    }),
    createAnalysisNext({
      analysisStrategy: AnalysisStrategy.MittNoSpammers,
      participantStats: {
        total: 85,
        variation_1: 51,
        variation_2: 34,
      },
      analysisDatetime: new Date(Date.UTC(2020, 4, 9)),
    }),
    createAnalysisNext({
      analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
      participantStats: {
        total: 80,
        variation_1: 48,
        variation_2: 32,
      },
      analysisDatetime: new Date(Date.UTC(2020, 4, 9)),
    }),
    createAnalysisNext({
      analysisStrategy: AnalysisStrategy.PpNaive,
      participantStats: {
        total: 70,
        variation_1: 42,
        variation_2: 28,
      },
      analysisDatetime: new Date(Date.UTC(2020, 4, 9)),
    }),

    // One example of a metric assignment with no data on one variation.
    createAnalysisNext({
      metricAssignmentId: 124,
      analysisStrategy: AnalysisStrategy.IttPure,
      participantStats: {
        total: 10,
        variation_1: 10,
      },
      metricEstimates: null,
    }),

    // Similar to the set of "latest" analyses for the default metric assignment, but with consistent recommendations.
    createAnalysisNext({
      metricAssignmentId: 126,
      analysisStrategy: AnalysisStrategy.IttPure,
      participantStats: {
        total: 2000,
        variation_1: 1200,
        variation_2: 800,
      },
    }),
    createAnalysisNext({
      metricAssignmentId: 126,
      analysisStrategy: AnalysisStrategy.MittNoCrossovers,
      participantStats: {
        total: 1800,
        variation_1: 1080,
        variation_2: 720,
      },
    }),
    createAnalysisNext({
      metricAssignmentId: 126,
      analysisStrategy: AnalysisStrategy.MittNoSpammers,
      participantStats: {
        total: 1700,
        variation_1: 920,
        variation_2: 780,
      },
    }),
    createAnalysisNext({
      metricAssignmentId: 126,
      analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
      participantStats: {
        total: 1600,
        variation_1: 960,
        variation_2: 640,
      },
    }),
    createAnalysisNext({
      metricAssignmentId: 126,
      analysisStrategy: AnalysisStrategy.PpNaive,
      participantStats: {
        total: 1400,
        variation_1: 840,
        variation_2: 560,
      },
    }),
    createAnalysisNext({
      metricAssignmentId: 126,
      analysisStrategy: AnalysisStrategy.PpNaive,
      participantStats: {
        total: 1200,
        variation_1: 940,
        variation_2: 660,
      },
      analysisDatetime: new Date(Date.UTC(2020, 5, 11)),
    }),
  ]
}

function createAnalysisPrevious(fieldOverrides: Partial<AnalysisPrevious>): AnalysisPrevious {
  return {
    metricAssignmentId: 123,
    analysisStrategy: AnalysisStrategy.IttPure,
    participantStats: {
      total: 1000,
      variation_1: 600,
      variation_2: 400,
    },
    metricEstimates: {
      ratio: { estimate: 0.0, bottom: 0.5, top: 1.5 },
      diff: { estimate: 0.0, bottom: -0.01, top: 0.01 },
      variation_1: { estimate: 0.12, bottom: 0, top: 10.0 },
      variation_2: { estimate: -0.12, bottom: -1.123, top: 1.0 },
    },
    analysisDatetime: new Date(Date.UTC(2020, 4, 10)),
    ...fieldOverrides,
  }
}

function createAnalysesPrevious(): AnalysisPrevious[] {
  return [
    // Full set of "latest" analyses for the default metric assignment.
    createAnalysisPrevious({
      analysisStrategy: AnalysisStrategy.IttPure,
      participantStats: {
        total: 1000,
        variation_1: 600,
        variation_2: 400,
      },
    }),
    createAnalysisPrevious({
      analysisStrategy: AnalysisStrategy.MittNoCrossovers,
      participantStats: {
        total: 900,
        variation_1: 540,
        variation_2: 360,
      },
    }),
    createAnalysisPrevious({
      analysisStrategy: AnalysisStrategy.MittNoSpammers,
      participantStats: {
        total: 850,
        variation_1: 510,
        variation_2: 340,
      },
    }),
    createAnalysisPrevious({
      analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
      participantStats: {
        total: 800,
        variation_1: 480,
        variation_2: 320,
      },
    }),
    createAnalysisPrevious({
      analysisStrategy: AnalysisStrategy.PpNaive,
      participantStats: {
        total: 700,
        variation_1: 420,
        variation_2: 280,
      },
    }),

    // Another set of analyses for the default metric assignment with an earlier date.
    createAnalysisPrevious({
      analysisStrategy: AnalysisStrategy.IttPure,
      participantStats: {
        total: 100,
        variation_1: 60,
        variation_2: 40,
      },
      analysisDatetime: new Date(Date.UTC(2020, 4, 9)),
    }),
    createAnalysisPrevious({
      analysisStrategy: AnalysisStrategy.MittNoCrossovers,
      participantStats: {
        total: 90,
        variation_1: 54,
        variation_2: 36,
      },
      analysisDatetime: new Date(Date.UTC(2020, 4, 9)),
    }),
    createAnalysisPrevious({
      analysisStrategy: AnalysisStrategy.MittNoSpammers,
      participantStats: {
        total: 85,
        variation_1: 51,
        variation_2: 34,
      },
      analysisDatetime: new Date(Date.UTC(2020, 4, 9)),
    }),
    createAnalysisPrevious({
      analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
      participantStats: {
        total: 80,
        variation_1: 48,
        variation_2: 32,
      },
      analysisDatetime: new Date(Date.UTC(2020, 4, 9)),
    }),
    createAnalysisPrevious({
      analysisStrategy: AnalysisStrategy.PpNaive,
      participantStats: {
        total: 70,
        variation_1: 42,
        variation_2: 28,
      },
      analysisDatetime: new Date(Date.UTC(2020, 4, 9)),
    }),

    // One example of a metric assignment with no data on one variation.
    createAnalysisPrevious({
      metricAssignmentId: 124,
      analysisStrategy: AnalysisStrategy.IttPure,
      participantStats: {
        total: 10,
        variation_1: 10,
      },
      metricEstimates: null,
    }),

    // Similar to the set of "latest" analyses for the default metric assignment, but with consistent recommendations.
    createAnalysisPrevious({
      metricAssignmentId: 126,
      analysisStrategy: AnalysisStrategy.IttPure,
      participantStats: {
        total: 2000,
        variation_1: 1200,
        variation_2: 800,
      },
    }),
    createAnalysisPrevious({
      metricAssignmentId: 126,
      analysisStrategy: AnalysisStrategy.MittNoCrossovers,
      participantStats: {
        total: 1800,
        variation_1: 1080,
        variation_2: 720,
      },
    }),
    createAnalysisPrevious({
      metricAssignmentId: 126,
      analysisStrategy: AnalysisStrategy.MittNoSpammers,
      participantStats: {
        total: 1700,
        variation_1: 920,
        variation_2: 780,
      },
    }),
    createAnalysisPrevious({
      metricAssignmentId: 126,
      analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
      participantStats: {
        total: 1600,
        variation_1: 960,
        variation_2: 640,
      },
    }),
    createAnalysisPrevious({
      metricAssignmentId: 126,
      analysisStrategy: AnalysisStrategy.PpNaive,
      participantStats: {
        total: 1400,
        variation_1: 840,
        variation_2: 560,
      },
    }),
    createAnalysisPrevious({
      metricAssignmentId: 126,
      analysisStrategy: AnalysisStrategy.PpNaive,
      participantStats: {
        total: 1200,
        variation_1: 940,
        variation_2: 660,
      },
      analysisDatetime: new Date(Date.UTC(2020, 5, 11)),
    }),
  ]
}

function createMetricAssignment(fieldOverrides: Partial<MetricAssignment>): MetricAssignment {
  return {
    metricAssignmentId: 123,
    metricId: 1,
    attributionWindowSeconds: AttributionWindowSeconds.OneWeek,
    changeExpected: true,
    isPrimary: true,
    minDifference: 0.1,
    ...fieldOverrides,
  }
}

/* istanbul ignore next; All coverage to be removed, see https://github.com/Automattic/abacus/issues/231 */
function createExperimentFullNew(fieldOverrides: Partial<ExperimentFullNew> = {}): ExperimentFullNew {
  const now = new Date()
  // This is a bit funky as we want to work in UTC but DateFns only does local time
  // and we want to avoid DST problems.
  const startDatetime = new Date(new Date(new Date().setMonth(now.getMonth() + 2)).setUTCHours(0, 0, 0, 0))
  const endDatetime = new Date(new Date(new Date().setMonth(now.getMonth() + 4)).setUTCHours(0, 0, 0, 0))
  return {
    name: 'experiment_1',
    startDatetime,
    endDatetime,
    platform: Platform.Calypso,
    ownerLogin: 'owner-nickname',
    description: 'Experiment with things. Change stuff. Profit.',
    existingUsersAllowed: false,
    p2Url: 'https://wordpress.com/experiment_1',
    variations: [
      {
        name: 'test',
        isDefault: false,
        allocatedPercentage: 40,
      },
      {
        name: 'control',
        isDefault: true,
        allocatedPercentage: 60,
      },
    ],
    metricAssignments: [
      createMetricAssignment({
        metricAssignmentId: 123,
        metricId: 1,
        attributionWindowSeconds: AttributionWindowSeconds.OneWeek,
        changeExpected: true,
        isPrimary: true,
        minDifference: 0.1,
      }),
      createMetricAssignment({
        metricAssignmentId: 124,
        metricId: 2,
        attributionWindowSeconds: AttributionWindowSeconds.FourWeeks,
        changeExpected: false,
        isPrimary: false,
        minDifference: 10.5,
      }),
      createMetricAssignment({
        metricAssignmentId: 125,
        metricId: 2,
        attributionWindowSeconds: AttributionWindowSeconds.OneHour,
        changeExpected: true,
        isPrimary: false,
        minDifference: 0.5,
      }),
      createMetricAssignment({
        metricAssignmentId: 126,
        metricId: 3,
        attributionWindowSeconds: AttributionWindowSeconds.SixHours,
        changeExpected: true,
        isPrimary: false,
        minDifference: 12,
      }),
    ],
    segmentAssignments: [],
    ...fieldOverrides,
  }
}

function createVariation(fieldOverrides: Partial<Variation> = {}): Variation {
  const variationId = fieldOverrides.variationId || 1
  const name = variationId === 1 ? 'control' : variationId === 2 ? 'test' : `treatment_${variationId - 1}`
  return {
    variationId,
    isDefault: variationId === 1 ? true : false,
    name,
    allocatedPercentage: 10,
    ...fieldOverrides,
  }
}

function createVariations(n: number): Variation[] {
  const allocatedPercentage = Math.floor(100 / n)
  return _.range(1, n + 1).map((variationId) =>
    createVariation({
      variationId,
      allocatedPercentage,
    }),
  )
}

function createExperimentFull(fieldOverrides: Partial<ExperimentFull> = {}): ExperimentFull {
  const fieldsOnlyForExistingExperiments = [
    'experimentId',
    'endReason',
    'conclusionUrl',
    'deployedVariationId',
    'status',
    'variations',
    'metricAssignments',
    'segmentAssignments',
    'exposureEvents',
    'assignmentCacheStatus',
  ]
  const newExperimentFieldOverrides = {
    ..._.omit(fieldOverrides, fieldsOnlyForExistingExperiments),
    exposureEvents: undefined,
    status: undefined,
    assignmentCacheStatus: undefined,
  }
  const existingExperimentFieldOverrides = _.pick(fieldOverrides, fieldsOnlyForExistingExperiments)

  return {
    ...createExperimentFullNew(newExperimentFieldOverrides),
    experimentId: 1,
    status: Status.Staging,
    endReason: null,
    conclusionUrl: null,
    deployedVariationId: null,
    variations: [
      createVariation({
        variationId: 2,
        name: 'test',
        isDefault: false,
        allocatedPercentage: 40,
      }),
      createVariation({
        allocatedPercentage: 60,
      }),
    ],
    metricAssignments: [
      createMetricAssignment({
        metricAssignmentId: 123,
        metricId: 1,
        attributionWindowSeconds: AttributionWindowSeconds.OneWeek,
        changeExpected: true,
        isPrimary: true,
        minDifference: 0.1,
      }),
      createMetricAssignment({
        metricAssignmentId: 124,
        metricId: 2,
        attributionWindowSeconds: AttributionWindowSeconds.FourWeeks,
        changeExpected: false,
        isPrimary: false,
        minDifference: 10.5,
      }),
      createMetricAssignment({
        metricAssignmentId: 125,
        metricId: 2,
        attributionWindowSeconds: AttributionWindowSeconds.OneHour,
        changeExpected: true,
        isPrimary: false,
        minDifference: 0.5,
      }),
      createMetricAssignment({
        metricAssignmentId: 126,
        metricId: 3,
        attributionWindowSeconds: AttributionWindowSeconds.SixHours,
        changeExpected: true,
        isPrimary: false,
        minDifference: 12,
      }),
    ],
    segmentAssignments: [
      {
        segmentAssignmentId: 1,
        segmentId: 1,
        isExcluded: true,
      },
    ],
    exposureEvents: [
      {
        event: 'event_name',
        props: {
          additionalProp1: 'prop1Value',
          additionalProp2: 'prop2Value',
          additionalProp3: 'prop3Value',
        },
      },
      {
        event: 'event_without_props',
      },
    ],
    exclusionGroupTagIds: [1],
    assignmentCacheStatus: AssignmentCacheStatus.Fresh,
    ...existingExperimentFieldOverrides,
  }
}

function createMetric(id: number, override?: Partial<Metric>): Metric {
  // Note: It is hard to reuse createMetric here as it is boxed
  //       Currently we only unbox it into an ApiData format which is different from this
  const parameterType = id % 2 === 0 ? MetricParameterType.Revenue : MetricParameterType.Conversion
  const eventParams = [{ event: 'event_name', props: { has_blocks: 'true' } }]
  const revenueParams = {
    refundDays: id * 2,
    productSlugs: ['xx-bundles'],
    transactionTypes: [TransactionTypes.NewPurchase],
  }
  return {
    metricId: id,
    name: `metric_${id}`,
    description: `This is metric ${id}`,
    parameterType,
    higherIsBetter: id % 3 === 0,
    eventParams: parameterType === MetricParameterType.Conversion ? eventParams : undefined,
    revenueParams: parameterType === MetricParameterType.Revenue ? revenueParams : undefined,
    ...override,
  }
}

function createMetrics(numMetrics = 3): Metric[] {
  return _.range(1, numMetrics + 1).map((id) => createMetric(id))
}

function createTagBare(id: number): TagBare {
  return {
    tagId: id,
    namespace: `tag_namespace_${id}`,
    name: `tag_${id}`,
    description: `This is tag ${id}`,
  }
}

function createTagBares(numTags = 3): TagBare[] {
  return _.range(1, numTags + 1).map(createTagBare)
}

const createTagFull = createTagBare

function createSegment(id: number): Segment {
  return {
    segmentId: id,
    name: `segment_${id}`,
    type: id % 2 === 0 ? SegmentType.Country : SegmentType.Locale,
  }
}

/**
 * Creates an array of segments.
 */
function createSegments(numSegments = 2): Segment[] {
  return _.range(1, numSegments + 1).map(createSegment)
}

function createSegmentAssignment(fieldOverrides: Partial<SegmentAssignment>): SegmentAssignment {
  return {
    segmentAssignmentId: 123,
    segmentId: 1,
    isExcluded: false,
    ...fieldOverrides,
  }
}

const Fixtures = {
  createAnalysesNext,
  createAnalysisNext,
  createAnalysesPrevious,
  createAnalysisPrevious,
  createDistributionStats,
  createExperimentFull,
  createExperimentFullNew,
  createMetricAssignment,
  createMetricEstimatesNext,
  createMetric,
  createMetrics,
  createTagBares,
  createTagFull,
  createSegmentAssignment,
  createSegments,
  createVariation,
  createVariations,
}

export default Fixtures
