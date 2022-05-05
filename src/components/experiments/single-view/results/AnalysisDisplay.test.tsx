import React from 'react'

import { Decision } from 'src/lib/recommendations'
import { AnalysisStrategy } from 'src/lib/schemas'
import Fixtures from 'src/test-helpers/fixtures'
import { render } from 'src/test-helpers/test-utils'

import AnalysisDisplay from './AnalysisDisplay'

test('renders MissingAnalysis correctly', () => {
  const { container } = render(
    <AnalysisDisplay
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
    <AnalysisDisplay
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

test('renders Inconclusive correctly', () => {
  const { container } = render(
    <AnalysisDisplay
      analysis={{
        analysisStrategy: AnalysisStrategy.PpNaive,
        decision: Decision.Inconclusive,
      }}
      experiment={Fixtures.createExperimentFull()}
    />,
  )
  expect(container).toMatchInlineSnapshot(`
    <div>
      Inconclusive
    </div>
  `)
})

test('renders NoDifference correctly', () => {
  const { container } = render(
    <AnalysisDisplay
      analysis={{
        analysisStrategy: AnalysisStrategy.PpNaive,
        decision: Decision.NoDifference,
      }}
      experiment={Fixtures.createExperimentFull()}
    />,
  )
  expect(container).toMatchInlineSnapshot(`
    <div>
      No difference
    </div>
  `)
})

test('renders VariantBarelyAhead correctly', () => {
  const { container } = render(
    <AnalysisDisplay
      analysis={{
        analysisStrategy: AnalysisStrategy.PpNaive,
        decision: Decision.VariantBarelyAhead,
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
      Variation_name_123
       barely ahead
    </div>
  `)
})

test('renders VariantAhead correctly', () => {
  const { container } = render(
    <AnalysisDisplay
      analysis={{
        analysisStrategy: AnalysisStrategy.PpNaive,
        decision: Decision.VariantAhead,
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
      Variation_name_123
       ahead
    </div>
  `)
})

test('renders VariantWins correctly', () => {
  const { container } = render(
    <AnalysisDisplay
      analysis={{
        analysisStrategy: AnalysisStrategy.PpNaive,
        decision: Decision.VariantWins,
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
      Variation_name_123
       wins
    </div>
  `)
})

test('throws error for missing chosenVariationId', () => {
  // Prevent an uncaught error warning due to React + TestingLibrary
  const originalConsoleError = console.error
  console.error = jest.fn()
  expect(() =>
    render(
      <AnalysisDisplay
        analysis={{
          analysisStrategy: AnalysisStrategy.PpNaive,
          decision: Decision.VariantWins,
          chosenVariationId: 123,
        }}
        experiment={Fixtures.createExperimentFull({
          variations: [],
        })}
      />,
    ),
  ).toThrowErrorMatchingInlineSnapshot(`"No match for chosenVariationId among variations in experiment."`)
  console.error = originalConsoleError
})

test('throws error for uncovered Recommendation', () => {
  // Prevent an uncaught error warning due to React + TestingLibrary
  const originalConsoleError = console.error
  console.error = jest.fn()
  expect(() =>
    render(
      <AnalysisDisplay
        analysis={{
          // @ts-ignore
          decision: 'Unknown Decision',
          chosenVariationId: 123,
        }}
        experiment={Fixtures.createExperimentFull({
          variations: [],
        })}
      />,
    ),
  ).toThrowErrorMatchingInlineSnapshot(`"Missing Decision."`)
  console.error = originalConsoleError
})
