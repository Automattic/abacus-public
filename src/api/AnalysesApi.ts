import * as Schemas from 'src/lib/schemas'

import { fetchApi } from './utils'

/**
 * Finds all the available analyses for the given experimentId.
 *
 * Note: Be sure to handle any errors that may be thrown.
 *
 * @throws UnauthorizedError
 */
async function findByExperimentId(experimentId: number): Promise<Schemas.Analysis[]> {
  return (
    await Schemas.analysisResponseSchema.validate(
      await fetchApi('GET', `/analyses/${experimentId}`, {
        abortEarly: false,
      }),
    )
  ).analyses
}

const AnalysesApi = {
  findByExperimentId,
}

export default AnalysesApi
