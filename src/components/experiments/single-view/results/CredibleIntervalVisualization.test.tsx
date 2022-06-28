import React from 'react'

import { render } from 'src/test-helpers/test-utils'

import CredibleIntervalVisualization from './CredibleIntervalVisualization'

test('renders CredibleIntervalVisualization correctly', () => {
  const { container } = render(<CredibleIntervalVisualization top={0.25} bottom={-0.1} minDifference={0.2} />)
  expect(container).toMatchSnapshot()
})
