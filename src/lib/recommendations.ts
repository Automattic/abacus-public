import { getExperimentRunHours } from './experiments'
import {
  AnalysisNext,
  AnalysisStrategy,
  ExperimentFull,
  Metric,
  MetricAssignment,
  Platform,
  Variation,
} from './schemas'

/**
 * # Recommendations
 *
 * > "A difference is a difference only if it makes a difference."
 * > Darrell Huff in “How to Lie with Statistics”
 *
 * ## Definitions
 *
 * - CI: Credible Interval, the bayesian version of a Confidence Interval.
 *   Without otherwise specifying we mean the 95% CI, this means it is an area
 *   which is 95% likely to contain the real value of what we are measuring.
 *
 * - minDifference: Experimenters set this for each MetricAssignment, this
 *   defines what sort of difference is practical.
 *
 * - ROPE: "Region of Practical Equivalance".
 *   The interval of [-minDifference, minDifference].
 *
 * ## Statistical Significance
 *
 * A difference CI is statistically significant if it doesn't contain 0.
 * This is the classical method used in statistics and isn't something we use
 * for recommendations but is included for debugging and better understanding
 * results.
 *
 * ## Practical Significance
 *
 * A difference CI is practically significant if it doesn't contain any part of
 * the ROPE. Practical significance is what we use for recommendations.
 *
 * Benefits of practical significance:
 * - More accurate burden of proof - tailored to the experimenters' decisions around specific metrics.
 *   For example a diff CI can be better than zero, but cost more to fully implement than any benefit from it.
 *   By using practical significance we can set the point of decision to exactly when the benefit outweighs the cost.
 * - Gives us a way to determine how long an experiment should run for - if the
 *   CI and ROPE only partially overlap the real value could be either within the
 *   ROPE or outside of it, we don't know. It turns out this is an unbiased way of
 *   letting us know that we should collect more data and run the experiment
 *   longer.
 * - Able to make decisions against implementing something.
 *   If the CI is contained in the ROPE we can actually reject the change completely.
 *
 * Practical significance is part of the approach described in
 * https://yanirseroussi.com/2016/06/19/making-bayesian-ab-testing-more-accessible/, which is based on
 * http://doingbayesiandataanalysis.blogspot.com/2013/11/optional-stopping-in-data-collection-p.html.
 *
 * See also some of Kruschke's resources on the topic:
 * * Precision as a goal for data collection: https://www.youtube.com/playlist?list=PL_mlm7M63Y7j641Y7QJG3TfSxeZMGOsQ4
 * * Bayesian estimation supersedes the t test: http://psy-ed.wdfiles.com/local--files/start/Kruschke2012.pdf
 * * Rejecting or accepting parameter values in Bayesian estimation: https://osf.io/s5vdy/download/?format=pdf
 */

/**
 * Whether the CI is outside the ROPE.
 *
 * See file-level documentation.
 */
export enum PracticalSignificanceStatus {
  Yes = 'Yes',
  No = 'No',
  Uncertain = 'Uncertain',
}

interface DiffCredibleIntervalStats {
  practicallySignificant: PracticalSignificanceStatus
  statisticallySignificant: boolean
  isPositive: boolean
}

/**
 * Gets statistics of the diff CI.
 *
 * See the file-level documentation.
 */
export function getDiffCredibleIntervalStats(
  analysis: AnalysisNext | null,
  metricAssignment: MetricAssignment,
  variationDiffKey: string,
): DiffCredibleIntervalStats | null {
  if (!analysis || !analysis.metricEstimates) {
    return null
  }

  if (
    analysis.metricEstimates.diffs[variationDiffKey].top_95 < analysis.metricEstimates.diffs[variationDiffKey].bottom_95
  ) {
    throw new Error('Invalid metricEstimates: bottom greater than top.')
  }

  // CI is entirely included in the interval of the experimenter set minDifference:
  let practicallySignificant = PracticalSignificanceStatus.No
  if (
    // CI is entirely above or below the experimenter set minDifference:
    metricAssignment.minDifference <= analysis.metricEstimates.diffs[variationDiffKey].bottom_95 ||
    analysis.metricEstimates.diffs[variationDiffKey].top_95 <= -metricAssignment.minDifference
  ) {
    practicallySignificant = PracticalSignificanceStatus.Yes
  } else if (
    // CI is partially above or below the experimenter set minDifference:
    metricAssignment.minDifference < analysis.metricEstimates.diffs[variationDiffKey].top_95 ||
    analysis.metricEstimates.diffs[variationDiffKey].bottom_95 < -metricAssignment.minDifference
  ) {
    practicallySignificant = PracticalSignificanceStatus.Uncertain
  }
  const statisticallySignificant =
    0 < analysis.metricEstimates.diffs[variationDiffKey].bottom_95 ||
    analysis.metricEstimates.diffs[variationDiffKey].top_95 < 0
  const isPositive = 0 < analysis.metricEstimates.diffs[variationDiffKey].bottom_95

  return {
    statisticallySignificant,
    practicallySignificant,
    isPositive,
  }
}

export enum Decision {
  ManualAnalysisRequired = 'ManualAnalysisRequired',
  MissingAnalysis = 'MissingAnalysis',
  NoDifference = 'NoDifference',
  VariantBarelyAhead = 'VariantBarelyAhead',
  Inconclusive = 'Inconclusive',
  VariantAhead = 'VariantAhead',
  VariantWins = 'VariantWins',
}

export interface Recommendation {
  analysisStrategy: AnalysisStrategy
  decision: Decision
  chosenVariationId?: number
  statisticallySignificant?: boolean
  practicallySignificant?: PracticalSignificanceStatus
  strongEnoughForDeployment?: boolean
}

function getDecisionFromDiffCredibleIntervalStats(diffCredibleIntervalStats: DiffCredibleIntervalStats): Decision {
  switch (diffCredibleIntervalStats.practicallySignificant) {
    case PracticalSignificanceStatus.No:
      return diffCredibleIntervalStats.statisticallySignificant ? Decision.VariantBarelyAhead : Decision.NoDifference

    case PracticalSignificanceStatus.Uncertain:
      return diffCredibleIntervalStats.statisticallySignificant ? Decision.VariantAhead : Decision.Inconclusive

    case PracticalSignificanceStatus.Yes:
      return Decision.VariantWins
  }
}

const maxSafeKruschke = {
  [Decision.NoDifference]: 0.9,
  [Decision.VariantBarelyAhead]: 0.45,
  [Decision.VariantAhead]: 1.5,
}

const minSafeRuntimeInDays = 7
export const runtimeWhitelistedPlatforms = [Platform.Email, Platform.Pipe]

/**
 * Returns deployment recommendation
 *
 * See the flowchart in https://github.com/Automattic/abacus/issues/660
 */

export function isDataStrongEnough(
  analysis: AnalysisNext | null,
  decision: Decision,
  experiment: ExperimentFull,
  metricAssignment: MetricAssignment,
  variationDiffKey: string,
): boolean {
  if (!analysis || !analysis.metricEstimates) {
    return false
  }

  // See Kruschke's Precision as a goal for data collection: https://www.youtube.com/playlist?list=PL_mlm7M63Y7j641Y7QJG3TfSxeZMGOsQ4
  const diffCiWidth = Math.abs(
    analysis.metricEstimates.diffs[variationDiffKey].top_95 -
      analysis.metricEstimates.diffs[variationDiffKey].bottom_95,
  )
  const ropeWidth = metricAssignment.minDifference * 2
  const kruschkeUncertainty = diffCiWidth / ropeWidth

  const runtimeInDays = getExperimentRunHours(experiment) / 24
  const hasEnoughRuntime =
    runtimeWhitelistedPlatforms.includes(experiment.platform) || runtimeInDays > minSafeRuntimeInDays

  switch (decision) {
    case Decision.VariantAhead:
    case Decision.VariantBarelyAhead:
    case Decision.NoDifference:
      return kruschkeUncertainty < maxSafeKruschke[decision] && hasEnoughRuntime

    case Decision.VariantWins:
      return runtimeInDays > minSafeRuntimeInDays

    default:
      return false
  }
}

/**
 * Returns the recommendation for a single analysis.
 *
 * See file-level recommendation documentation.
 */
export function getMetricAssignmentRecommendation(
  experiment: ExperimentFull,
  metric: Metric,
  analysis: AnalysisNext,
  variationDiffKey: string,
): Recommendation {
  const metricAssignment = experiment.metricAssignments.find(
    (metricAssignment) => metricAssignment.metricAssignmentId === analysis.metricAssignmentId,
  )
  const diffCredibleIntervalStats =
    metricAssignment && getDiffCredibleIntervalStats(analysis, metricAssignment, variationDiffKey)
  const analysisStrategy = analysis.analysisStrategy
  if (!analysis.metricEstimates || !metricAssignment || !diffCredibleIntervalStats) {
    return {
      analysisStrategy,
      decision: Decision.MissingAnalysis,
      strongEnoughForDeployment: false,
    }
  }

  const { practicallySignificant, statisticallySignificant, isPositive } = diffCredibleIntervalStats
  const decision = getDecisionFromDiffCredibleIntervalStats(diffCredibleIntervalStats)
  const defaultVariation = experiment.variations.find((variation) => variation.isDefault) as Variation
  const nonDefaultVariation = experiment.variations.find((variation) => !variation.isDefault) as Variation
  let chosenVariationId = undefined
  if ([Decision.VariantBarelyAhead, Decision.VariantAhead, Decision.VariantWins].includes(decision)) {
    chosenVariationId =
      isPositive === metric.higherIsBetter ? nonDefaultVariation.variationId : defaultVariation.variationId
  }

  const strongEnoughForDeployment = isDataStrongEnough(
    analysis,
    decision,
    experiment,
    metricAssignment,
    variationDiffKey,
  )

  return {
    analysisStrategy,
    decision,
    chosenVariationId,
    statisticallySignificant,
    practicallySignificant,
    strongEnoughForDeployment,
  }
}

/**
 * Takes an array of recommendations using different strategies, and returns an recommendation over them.
 * Checks for recommendation conflicts - currently different chosenVariationIds - and returns manual analysis required decision.
 */
export function getAggregateMetricAssignmentRecommendation(
  recommendations: Recommendation[],
  targetAnalysisStrategy: AnalysisStrategy,
): Recommendation {
  const targetAnalysisRecommendation = recommendations.find(
    (recommendation) => recommendation.analysisStrategy === targetAnalysisStrategy,
  )
  if (!targetAnalysisRecommendation) {
    return {
      analysisStrategy: targetAnalysisStrategy,
      decision: Decision.MissingAnalysis,
      strongEnoughForDeployment: false,
    }
  }

  // There is a conflict if there are different chosenVariationIds:
  if (1 < new Set(recommendations.map((x) => x.chosenVariationId).filter((x) => x)).size) {
    return {
      ...targetAnalysisRecommendation,
      decision: Decision.ManualAnalysisRequired,
      chosenVariationId: undefined,
    }
  }

  return targetAnalysisRecommendation
}
