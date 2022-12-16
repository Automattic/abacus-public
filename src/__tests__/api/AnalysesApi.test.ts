import AnalysesApi from 'src/api/explat/AnalysesApi'
import { validationErrorDisplayer } from 'src/test-helpers/test-utils'

// In order to not go over API limits on swagger we wait in-between tests:
const apiLimitWait = 1000
beforeEach(async () => {
  return new Promise((resolve) => setTimeout(resolve, apiLimitWait))
})

describe('AnalysesApi.ts module', () => {
  describe('findByExperimentId', () => {
    it('should return a set of analyses with the expected shape', async () => {
      const analyses = await validationErrorDisplayer(AnalysesApi.findByExperimentId(123))
      expect(analyses.length).toBeGreaterThan(0)
    })
  })
})
