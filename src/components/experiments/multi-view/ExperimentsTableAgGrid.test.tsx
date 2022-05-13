import { fireEvent, screen } from '@testing-library/react'
import addToDate from 'date-fns/add'
import React from 'react'

import { ExperimentSummary, Platform, Status } from 'src/lib/schemas'
import { changeFieldByRole, render } from 'src/test-helpers/test-utils'

import ExperimentsTableAgGrid from './ExperimentsTableAgGrid'

it('should render an empty table', () => {
  const { container } = render(<ExperimentsTableAgGrid experiments={[]} />)

  expect(container).toMatchSnapshot()
})

it('should render a table with experiments, allow searching and resetting', async () => {
  const experiments: ExperimentSummary[] = [
    {
      experimentId: 1,
      name: 'First',
      endDatetime: addToDate(new Date(), { days: 14 }),
      ownerLogin: 'Owner',
      platform: Platform.Wpcom,
      startDatetime: new Date(),
      status: Status.Staging,
      description: 'hidden description text',
      analyses: [],
    },
  ]
  const { container } = render(<ExperimentsTableAgGrid experiments={experiments} />)

  expect(container).toMatchSnapshot()

  await changeFieldByRole('textbox', /Search/, 'explat_test')
  expect(container).toMatchSnapshot()

  const resetButton = screen.getByRole('button', { name: /Reset/ })
  fireEvent.click(resetButton)
  expect(container).toMatchSnapshot()
})
