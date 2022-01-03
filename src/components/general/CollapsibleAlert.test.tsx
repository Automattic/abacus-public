import { fireEvent, screen } from '@testing-library/react'
import React from 'react'

import { render } from 'src/test-helpers/test-utils'

import CollapsibleAlert from './CollapsibleAlert'

test('renders as collapsed alert', () => {
  const { container } = render(
    <CollapsibleAlert id={'test-alert-1'} severity={'info'} summary={'This is the alert summary.'}>
      This is the content of the alert.
    </CollapsibleAlert>,
  )

  expect(container).toMatchSnapshot()
})

test('renders as expanded alert', async () => {
  const { container } = render(
    <CollapsibleAlert id={'test-alert-2'} severity={'info'} summary={'This is the alert summary.'}>
      This is the content of the alert.
    </CollapsibleAlert>,
  )

  const button = await screen.findByRole('button')
  fireEvent.click(button)
  expect(container).toMatchSnapshot()
})
