import * as Schemas from 'src/lib/schemas'

import { fetchApi } from './utils'

/**
 * Finds all the available analyses for the given experimentId.
 *
 * Note: Be sure to handle any errors that may be thrown.
 *
 * @throws UnauthorizedError
 */
async function findByExperimentId(experimentId: number): Promise<Schemas.AnalysisPrevious[]> {
  // We can be loose with the types here as we validate everything below.
  const analysesResponse = (await fetchApi('GET', `/analyses/${experimentId}`, {
    abortEarly: false,
  })) as { analyses: { metric_estimates: Schemas.MetricEstimatesPrevious | Schemas.MetricEstimatesNext | null }[] }

  analysesResponse.analyses = (analysesResponse.analyses.map(Schemas.ensureRawAnalysisPrevious) as unknown) as {
    metric_estimates: Schemas.MetricEstimatesPrevious | Schemas.MetricEstimatesNext | null
  }[]

  const { analyses } = await Schemas.analysisResponseSchema.validate(analysesResponse)
  return analyses
}

const AnalysesApi = {
  findByExperimentId,
}

export default AnalysesApi
