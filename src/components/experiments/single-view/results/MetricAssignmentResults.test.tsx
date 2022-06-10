import { fireEvent, screen } from '@testing-library/react'
import React from 'react'
import Plot from 'react-plotly.js'

import { Decision, PracticalSignificanceStatus } from 'src/lib/recommendations'
import { AnalysisStrategy } from 'src/lib/schemas'
import Fixtures from 'src/test-helpers/fixtures'
import { render } from 'src/test-helpers/test-utils'

import MetricAssignmentResults from './MetricAssignmentResults'

// Unfortunately Plotly doesn't produce graphs with deterministic IDs so we have to mock it
jest.mock('react-plotly.js')
const mockedPlot = Plot as jest.MockedClass<typeof Plot>
beforeEach(() => {
  mockedPlot.mockClear()
})

describe('MetricAssignmentResults', () => {
  it('highlights only the selected variations of A/B/n experiments', () => {
    const variations = Fixtures.createVariations(3)
    const abnExperiment = Fixtures.createExperimentFull({ variations })

    const { container } = render(
      <MetricAssignmentResults
        strategy={AnalysisStrategy.PpNaive}
        metricAssignment={Fixtures.createMetricAssignment({})}
        metric={Fixtures.createMetrics(1)[0]}
        analysesByStrategyDateAsc={{
          [AnalysisStrategy.PpNaive]: [Fixtures.createMultiVariationAnalysis({})],
          [AnalysisStrategy.MittNoSpammersNoCrossovers]: [],
          [AnalysisStrategy.MittNoSpammers]: [],
          [AnalysisStrategy.MittNoCrossovers]: [],
          [AnalysisStrategy.IttPure]: [],
        }}
        experiment={abnExperiment}
        recommendation={{
          analysisStrategy: AnalysisStrategy.PpNaive,
          decision: Decision.NoDifference,
          practicallySignificant: PracticalSignificanceStatus.Yes,
        }}
        variationDiffKey='2_1'
      />,
    )

    expect(container.querySelectorAll('[class*="rowVariationNotSelected"]')).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: /"Observed" data/ }))
    expect(container.querySelectorAll('[class*="rowVariationNotSelected"]')).toHaveLength(2)
  })

  it('renders an appropriate message with no analyses', () => {
    const experiment = Fixtures.createExperimentFull()
    const { container } = render(
      <MetricAssignmentResults
        strategy={AnalysisStrategy.PpNaive}
        metricAssignment={Fixtures.createMetricAssignment({})}
        metric={Fixtures.createMetrics(1)[0]}
        analysesByStrategyDateAsc={{
          [AnalysisStrategy.PpNaive]: [],
          [AnalysisStrategy.MittNoSpammersNoCrossovers]: [],
          [AnalysisStrategy.MittNoSpammers]: [],
          [AnalysisStrategy.MittNoCrossovers]: [],
          [AnalysisStrategy.IttPure]: [],
        }}
        experiment={experiment}
        recommendation={{
          analysisStrategy: AnalysisStrategy.PpNaive,
          decision: Decision.NoDifference,
        }}
        variationDiffKey='2_1'
      />,
    )
    expect(container).toMatchSnapshot()
  })
})
