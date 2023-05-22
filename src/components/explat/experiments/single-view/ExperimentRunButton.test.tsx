/* eslint-disable @typescript-eslint/require-await */
import { act, fireEvent, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import { add } from 'date-fns'
import MockDate from 'mockdate'
import React from 'react'

import ExperimentsApi from 'src/api/explat/ExperimentsApi'
import { experimentToFormData } from 'src/lib/explat/form-data'
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
  const newEndDatetime = add(new Date(initialEndDatetime), { days: 1 }).toISOString().substring(0, 10)

  const allRunButtons = screen.getAllByRole('button', { name: /Launch/ })

  // Invalid endDatetime
  await act(async () => {
    fireEvent.change(endDateInput, { target: { value: '1999-12-31' } })
  })
  expect(baseElement).toMatchSnapshot()
  expect((allRunButtons as HTMLButtonElement[]).some((button) => !!button?.disabled)).toBe(true)

  // Valid endDatetime
  await act(async () => {
    fireEvent.change(endDateInput, { target: { value: newEndDatetime } })
  })
  expect(screen).toMatchSnapshot()
  expect((allRunButtons as HTMLButtonElement[]).every((button) => !button.disabled)).toBe(true)

  const p2UrlInput = screen.getByLabelText(/Your a8cexperiments P2 post URL/)
  const newP2Url = 'http://www.example_2.com'

  // Invalid p2Url
  await act(async () => {
    fireEvent.change(p2UrlInput, { target: { value: 'bad url' } })
  })
  expect((allRunButtons as HTMLButtonElement[]).some((button) => !!button?.disabled)).toBe(true)

  // Valid p2Url
  await act(async () => {
    fireEvent.change(p2UrlInput, { target: { value: newP2Url } })
  })
  expect((allRunButtons as HTMLButtonElement[]).every((button) => !button.disabled)).toBe(true)

  // Launch
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
  expect(mockedExperimentsApi.put).toHaveBeenCalledWith(1, {
    ...experimentToFormData(experiment),
    endDatetime: newEndDatetime,
    p2Url: newP2Url,
  })
  expect(mockedExperimentsApi.put).toMatchInlineSnapshot(`
    [MockFunction] {
      "calls": Array [
        Array [
          1,
          Object {
            "description": "Experiment with things. Change stuff. Profit.",
            "endDatetime": "2020-11-22",
            "exclusionGroupTagIds": Array [
              1,
            ],
            "existingUsersAllowed": "false",
            "exposureEvents": Array [
              Object {
                "event": "event_name",
                "props": Array [
                  Object {
                    "key": "additionalProp1",
                    "value": "prop1Value",
                  },
                  Object {
                    "key": "additionalProp2",
                    "value": "prop2Value",
                  },
                  Object {
                    "key": "additionalProp3",
                    "value": "prop3Value",
                  },
                ],
              },
              Object {
                "event": "event_without_props",
                "props": Array [],
              },
            ],
            "metricAssignments": Array [
              Object {
                "attributionWindowSeconds": "604800",
                "changeExpected": true,
                "isPrimary": true,
                "metricId": "1",
                "minDifference": "0.1",
              },
              Object {
                "attributionWindowSeconds": "2419200",
                "changeExpected": false,
                "isPrimary": false,
                "metricId": "2",
                "minDifference": "10.5",
              },
              Object {
                "attributionWindowSeconds": "3600",
                "changeExpected": true,
                "isPrimary": false,
                "metricId": "2",
                "minDifference": "0.5",
              },
              Object {
                "attributionWindowSeconds": "21600",
                "changeExpected": true,
                "isPrimary": false,
                "metricId": "3",
                "minDifference": "12",
              },
            ],
            "name": "experiment_1",
            "ownerLogin": "owner-nickname",
            "p2Url": "http://www.example_2.com",
            "platform": "calypso",
            "segmentAssignments": Array [
              Object {
                "isExcluded": true,
                "segmentId": 1,
              },
            ],
            "startDatetime": "2020-09-21",
            "variations": Array [
              Object {
                "allocatedPercentage": "40",
                "isDefault": false,
                "name": "test",
              },
              Object {
                "allocatedPercentage": "60",
                "isDefault": true,
                "name": "control",
              },
            ],
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
