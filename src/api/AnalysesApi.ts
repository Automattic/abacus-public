import * as Schemas from 'src/lib/schemas'

import { fetchApi } from './utils'

/**
 * Finds all the available analyses for the given experimentId.
 *
 * Note: Be sure to handle any errors that may be thrown.
 *
 * @throws UnauthorizedError
 */
async function findByExperimentId(experimentId: number): Promise<(Schemas.AnalysisNext | Schemas.AnalysisPrevious)[]> {
  // We can be loose with the types here as we validate everything below.
  const analysesResponse = (await fetchApi('GET', `/analyses/${experimentId}`, {
    abortEarly: false,
  })) as { analyses: { metric_estimates: unknown }[] }

  const analyses = analysesResponse.analyses.map((maybeAnalysis) =>
    // istanbul ignore next; Transitional
    Object.hasOwnProperty.call(maybeAnalysis, 'metric_estimates') &&
    !!maybeAnalysis?.metric_estimates &&
    Schemas.isRawMetricEstimatesNext(maybeAnalysis?.metric_estimates)
      ? Schemas.analysisNextSchema.validateSync(maybeAnalysis)
      : Schemas.analysisPreviousSchema.validateSync(maybeAnalysis),
  )

  return analyses
}

const AnalysesApi = {
  findByExperimentId,
}

export default AnalysesApi
