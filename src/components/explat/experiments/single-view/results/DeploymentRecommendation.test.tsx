import React from 'react'

import { Decision } from 'src/lib/explat/recommendations'
import { AnalysisStrategy } from 'src/lib/explat/schemas'
import Fixtures from 'src/test-helpers/fixtures'
import { render } from 'src/test-helpers/test-utils'

import DeploymentRecommendation from './DeploymentRecommendation'

test('renders MissingAnalysis correctly', () => {
  const { container } = render(
    <DeploymentRecommendation
      analysis={{
        analysisStrategy: AnalysisStrategy.PpNaive,
        decision: Decision.MissingAnalysis,
      }}
      experiment={Fixtures.createExperimentFull()}
    />,
  )
  expect(container).toMatchInlineSnapshot(`
    <div>
      Not analyzed yet
    </div>
  `)
})

test('renders ManualAnalysisRequired correctly', () => {
  const { container } = render(
    <DeploymentRecommendation
      analysis={{
        analysisStrategy: AnalysisStrategy.PpNaive,
        decision: Decision.ManualAnalysisRequired,
      }}
      experiment={Fixtures.createExperimentFull()}
    />,
  )
  expect(container).toMatchInlineSnapshot(`
    <div>
      <span
        class="makeStyles-tooltipped-2"
        title="Contact @experimentation-review on #a8c-experiments"
      >
        Manual analysis required
      </span>
    </div>
  `)
})

test('renders recommendation for NoDifference decision correctly', () => {
  const { container } = render(
    <DeploymentRecommendation
      analysis={{
        analysisStrategy: AnalysisStrategy.PpNaive,
        decision: Decision.NoDifference,
        strongEnoughData: true,
      }}
      experiment={Fixtures.createExperimentFull()}
    />,
  )
  expect(container).toMatchInlineSnapshot(`
    <div>
      Deploy either variation
    </div>
  `)
})

test('renders recommendation correctly when data is not strong enough', () => {
  const { container } = render(
    <DeploymentRecommendation
      analysis={{
        analysisStrategy: AnalysisStrategy.PpNaive,
        decision: Decision.NoDifference,
        strongEnoughData: false,
      }}
      experiment={Fixtures.createExperimentFull()}
    />,
  )
  expect(container).toMatchInlineSnapshot(`
    <div>
      Not enough certainty
    </div>
  `)
})

test('renders recommendation for VariantBarelyAhead decision correctly', () => {
  const { container } = render(
    <DeploymentRecommendation
      analysis={{
        analysisStrategy: AnalysisStrategy.PpNaive,
        decision: Decision.VariantBarelyAhead,
        strongEnoughData: true,
        chosenVariationId: 123,
      }}
      experiment={Fixtures.createExperimentFull({
        variations: [
          {
            variationId: 123,
            name: 'variation_name_123',
            allocatedPercentage: 1,
            isDefault: false,
          },
        ],
      })}
    />,
  )
  expect(container).toMatchInlineSnapshot(`
    <div>
      Deploy 
      variation_name_123
       cautiously
    </div>
  `)
})

test('renders recommendation for VariantAhead decision correctly', () => {
  const { container } = render(
    <DeploymentRecommendation
      analysis={{
        analysisStrategy: AnalysisStrategy.PpNaive,
        decision: Decision.VariantAhead,
        strongEnoughData: true,
        chosenVariationId: 123,
      }}
      experiment={Fixtures.createExperimentFull({
        variations: [
          {
            variationId: 123,
            name: 'variation_name_123',
            allocatedPercentage: 1,
            isDefault: false,
          },
        ],
      })}
    />,
  )
  expect(container).toMatchInlineSnapshot(`
    <div>
      Deploy 
      variation_name_123
       cautiously
    </div>
  `)
})

test('renders recommendation for VariantWinning decision correctly', () => {
  const { container } = render(
    <DeploymentRecommendation
      analysis={{
        analysisStrategy: AnalysisStrategy.PpNaive,
        decision: Decision.VariantWinning,
        strongEnoughData: true,
        chosenVariationId: 123,
      }}
      experiment={Fixtures.createExperimentFull({
        variations: [
          {
            variationId: 123,
            name: 'variation_name_123',
            allocatedPercentage: 1,
            isDefault: false,
          },
        ],
      })}
    />,
  )
  expect(container).toMatchInlineSnapshot(`
    <div>
      Deploy 
      variation_name_123
       with confidence
    </div>
  `)
})
