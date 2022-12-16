import React from 'react'

import { Decision } from 'src/lib/explat/recommendations'
import { AnalysisStrategy } from 'src/lib/explat/schemas'
import { render } from 'src/test-helpers/test-utils'

import CredibleIntervalVisualization from './CredibleIntervalVisualization'

test('renders CredibleIntervalVisualization correctly', () => {
  const { container } = render(
    <CredibleIntervalVisualization
      top={0.25}
      bottom={-0.1}
      minDifference={0.2}
      recommendation={{
        analysisStrategy: AnalysisStrategy.PpNaive,
        decision: Decision.NoDifference,
        strongEnoughData: true,
      }}
    />,
  )
  expect(container).toMatchSnapshot()
})
