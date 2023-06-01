import React from 'react'

import Fixtures from 'src/test-helpers/fixtures'
import { render } from 'src/test-helpers/test-utils'

import ExperimentSetup from './ExperimentSetup'

const experiment = Fixtures.createExperimentFull()
const metrics = Fixtures.createMetrics()

test('renders as expected', () => {
  const { container } = render(<ExperimentSetup experiment={experiment} metrics={metrics} />)

  expect(container).toMatchSnapshot()
})

test('renders as expected with no audience targeting', () => {
  const experiment = Fixtures.createExperimentFull({
    segmentAssignments: [],
  })
  const { container } = render(<ExperimentSetup experiment={experiment} metrics={metrics} />)

  expect(container).toMatchSnapshot()
})
