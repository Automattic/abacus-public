import { act, fireEvent, getByRole, screen, waitFor } from '@testing-library/react'
import _ from 'lodash'
import React from 'react'

import ExperimentsApi from 'src/api/ExperimentsApi'
import { MetricParameterType, Status } from 'src/lib/schemas'
import Fixtures from 'src/test-helpers/fixtures'
import { changeFieldByRole, interactWithMinDiffCalculator, render } from 'src/test-helpers/test-utils'

import MetricAssignmentForm from './MetricAssignmentForm'

jest.mock('src/api/ExperimentsApi')
const mockedExperimentsApi = ExperimentsApi as jest.Mocked<typeof ExperimentsApi>

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function fillMetricAssignmentForm() {
  const metricSearchField = screen.getByRole('combobox', { name: /Select a metric/ })
  const metricSearchFieldMoreButton = getByRole(metricSearchField, 'button', { name: 'Open' })
  fireEvent.click(metricSearchFieldMoreButton)
  fireEvent.click(await screen.findByRole('option', { name: /metric_3/ }))
  expect(screen.queryByRole('button', { name: /Minimum Difference Calculator/ })).toBeEnabled()

  // The min-diff calculator toggle should be disabled when the metric is cleared
  fireEvent.click(screen.getByTitle('Clear'))
  expect(screen.queryByRole('button', { name: /Minimum Difference Calculator/ })).toBeDisabled()
  fireEvent.click(metricSearchFieldMoreButton)
  fireEvent.click(await screen.findByRole('option', { name: /metric_3/ }))

  const attributionWindowField = await screen.findByLabelText(/Attribution Window/)
  await act(async () => {
    fireEvent.focus(attributionWindowField)
  })
  await act(async () => {
    fireEvent.keyDown(attributionWindowField, { key: 'Enter' })
  })
  const attributionWindowFieldOption = await screen.findByRole('option', { name: /24 hours/ })
  await act(async () => {
    fireEvent.click(attributionWindowFieldOption)
  })

  await changeFieldByRole('spinbutton', /Minimum Difference/, '1')
}

test('Assign metric by selecting metric, attribution window and using min diff calculator', async () => {
  const metrics = Fixtures.createMetrics(5)
  const experiment = Fixtures.createExperimentFull({ status: Status.Running })
  const onSuccessAssignMetric = jest.fn()
  const onCancelAssignMetric = jest.fn()

  render(
    <MetricAssignmentForm
      experiment={experiment}
      metrics={metrics}
      onSuccess={onSuccessAssignMetric}
      onCancel={onCancelAssignMetric}
    />,
  )

  mockedExperimentsApi.assignMetric.mockReset()
  // @ts-ignore
  mockedExperimentsApi.assignMetric.mockImplementationOnce(async () => null)

  await waitFor(() => screen.getByRole('button', { name: 'Assign' }))

  await fillMetricAssignmentForm()

  // Toggle the min-diff calculator
  screen.getByRole('button', { name: /Minimum Difference Calculator/ }).click()
  expect(screen.queryByText(/Calculator: Minimum practical difference/)).toBeVisible()

  screen.getByRole('button', { name: /Minimum Difference Calculator/ }).click()
  expect(screen.queryByText(/Calculator: Minimum practical difference/)).not.toBeVisible()

  // Use the min-diff calculator
  screen.getByRole('button', { name: /Minimum Difference Calculator/ }).click()
  await interactWithMinDiffCalculator(MetricParameterType.Conversion, '500000', '10', '1000')
  const expectedMinDiff = 0.2
  expect(screen.getByRole('spinbutton', { name: /Minimum Difference/ })).toHaveValue(expectedMinDiff)

  const assignButton = screen.getByRole('button', { name: 'Assign' })
  fireEvent.click(assignButton)
  await waitFor(() => screen.queryByText(/Metric Assigned Successfully!/))

  expect(mockedExperimentsApi.assignMetric).toHaveBeenCalledTimes(1)
  expect(mockedExperimentsApi.assignMetric).toHaveBeenLastCalledWith(experiment, {
    attributionWindowSeconds: '86400',
    changeExpected: false,
    isPrimary: false,
    metricId: 3,
    minDifference: expectedMinDiff / 100,
  })

  expect(mockedExperimentsApi.assignMetric).toHaveBeenCalledTimes(1)
  expect(onSuccessAssignMetric).toHaveBeenCalledTimes(1)

  screen.getByRole('button', { name: /Cancel/ }).click()
  expect(onCancelAssignMetric).toHaveBeenCalledTimes(1)
})
