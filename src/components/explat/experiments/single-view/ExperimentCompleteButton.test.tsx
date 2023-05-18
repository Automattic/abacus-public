/* eslint-disable @typescript-eslint/require-await */
import { fireEvent, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import MockDate from 'mockdate'
import React from 'react'

import ExperimentsApi from 'src/api/explat/ExperimentsApi'
import { Status } from 'src/lib/explat/schemas'
import Fixtures from 'src/test-helpers/fixtures'
import { render } from 'src/test-helpers/test-utils'

import ExperimentCompleteButton from './ExperimentCompleteButton'

MockDate.set('2020-07-21')

jest.mock('src/api/explat/ExperimentsApi')
const mockedExperimentsApi = ExperimentsApi as jest.Mocked<typeof ExperimentsApi>

test('renders as expected', () => {
  const experimentReloadRef: React.MutableRefObject<() => void> = { current: jest.fn() }
  const experiment = Fixtures.createExperimentFull()
  const { container } = render(<ExperimentCompleteButton {...{ experiment, experimentReloadRef }} />)

  expect(container).toMatchSnapshot()
})

test('completes an experiment', async () => {
  const experimentReloadRef: React.MutableRefObject<() => void> = { current: jest.fn() }
  const experiment = Fixtures.createExperimentFull({ status: Status.Running })
  const { container } = render(<ExperimentCompleteButton {...{ experiment, experimentReloadRef }} />)

  mockedExperimentsApi.changeStatus.mockReset()
  mockedExperimentsApi.changeStatus.mockImplementationOnce(async () => undefined)

  const firstCompleteButton = screen.getByRole('button', { name: /Complete/ })

  // First Opening - We cancel
  fireEvent.click(firstCompleteButton)

  await waitFor(() => screen.getByRole('button', { name: /Cancel/ }))

  expect(container).toMatchSnapshot()

  const cancelButton = screen.getByRole('button', { name: /Cancel/ })
  fireEvent.click(cancelButton)
  await waitForElementToBeRemoved(cancelButton)

  expect(mockedExperimentsApi.changeStatus).toHaveBeenCalledTimes(0)
  expect(experimentReloadRef.current).toHaveBeenCalledTimes(0)

  // Second Opening - We complete
  fireEvent.click(firstCompleteButton)

  await waitFor(() => screen.getByRole('button', { name: /Cancel/ }))
  const cancelButton2nd = screen.getByRole('button', { name: /Cancel/ })

  const allCompleteButtons = screen.getAllByRole('button', { name: /Complete/ })
  allCompleteButtons.forEach((button) => fireEvent.click(button))

  await waitForElementToBeRemoved(cancelButton2nd)

  expect(mockedExperimentsApi.changeStatus).toHaveBeenCalledTimes(1)
  expect(experimentReloadRef.current).toHaveBeenCalledTimes(1)
  expect(mockedExperimentsApi.changeStatus).toMatchInlineSnapshot(`
    [MockFunction] {
      "calls": Array [
        Array [
          1,
          "completed",
        ],
      ],
      "results": Array [
        Object {
          "type": "return",
          "value": Promise {},
        },
      ],
    }
  `)
})
