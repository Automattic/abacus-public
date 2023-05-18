/* eslint-disable @typescript-eslint/require-await */
import { act, fireEvent, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import MockDate from 'mockdate'
import React from 'react'

import ExperimentsApi from 'src/api/explat/ExperimentsApi'
import Fixtures from 'src/test-helpers/fixtures'
import { render } from 'src/test-helpers/test-utils'

import ExperimentRunButton from './ExperimentRunButton'

MockDate.set('2020-07-21')

jest.mock('src/api/explat/ExperimentsApi')
const mockedExperimentsApi = ExperimentsApi as jest.Mocked<typeof ExperimentsApi>

test('renders as expected', () => {
  const experimentReloadRef: React.MutableRefObject<() => void> = { current: jest.fn() }
  const experiment = Fixtures.createExperimentFull()
  const { container } = render(<ExperimentRunButton {...{ experiment, experimentReloadRef }} />)

  expect(container).toMatchSnapshot()
})

test('runs an experiment', async () => {
  const experimentReloadRef: React.MutableRefObject<() => void> = { current: jest.fn() }
  const experiment = Fixtures.createExperimentFull()
  const { baseElement } = render(<ExperimentRunButton {...{ experiment, experimentReloadRef }} />)

  mockedExperimentsApi.changeStatus.mockReset()
  mockedExperimentsApi.changeStatus.mockImplementationOnce(async () => undefined)

  const firstRunButton = screen.getByRole('button', { name: /Launch/ })

  // First Opening - We cancel
  fireEvent.click(firstRunButton)

  await waitFor(() => screen.getByRole('button', { name: /Cancel/ }))

  expect(baseElement).toMatchSnapshot()

  const cancelButton = screen.getByRole('button', { name: /Cancel/ })
  fireEvent.click(cancelButton)
  await waitForElementToBeRemoved(cancelButton)

  expect(mockedExperimentsApi.changeStatus).toHaveBeenCalledTimes(0)
  expect(experimentReloadRef.current).toHaveBeenCalledTimes(0)

  // Second Opening
  fireEvent.click(firstRunButton)

  await waitFor(() => screen.getByRole('button', { name: /Cancel/ }))
  const cancelButton2nd = screen.getByRole('button', { name: /Cancel/ })

  const endDateInput = screen.getByLabelText(/End date/)
  const initialEndDatetime = (endDateInput as HTMLInputElement).value

  // Invalid endDatetime
  await act(async () => {
    fireEvent.change(endDateInput, { target: { value: '1999-12-31' } })
  })
  expect(baseElement).toMatchSnapshot()
  const allRunButtons = screen.getAllByRole('button', { name: /Launch/ })
  expect((allRunButtons as HTMLButtonElement[]).some((button) => !!button?.disabled)).toBe(true)

  // Valid endDatetime
  await act(async () => {
    fireEvent.change(endDateInput, { target: { value: initialEndDatetime } })
  })
  expect(screen).toMatchSnapshot()
  expect((allRunButtons as HTMLButtonElement[]).every((button) => !button.disabled)).toBe(true)

  allRunButtons.forEach((button) => fireEvent.click(button))

  await waitForElementToBeRemoved(cancelButton2nd)

  expect(mockedExperimentsApi.changeStatus).toHaveBeenCalledTimes(1)
  expect(experimentReloadRef.current).toHaveBeenCalledTimes(2)
  expect(mockedExperimentsApi.changeStatus).toMatchInlineSnapshot(`
    [MockFunction] {
      "calls": Array [
        Array [
          1,
          "running",
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
  expect(mockedExperimentsApi.patch).toMatchInlineSnapshot(`
    [MockFunction] {
      "calls": Array [
        Array [
          1,
          Object {
            "endDatetime": "2020-11-21",
          },
        ],
      ],
      "results": Array [
        Object {
          "type": "return",
          "value": undefined,
        },
      ],
    }
  `)
})
