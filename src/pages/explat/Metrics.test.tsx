import { screen, waitFor } from '@testing-library/react'
import React from 'react'

import MetricsApi from 'src/api/explat/MetricsApi'
import Fixtures from 'src/test-helpers/fixtures'
import { render } from 'src/test-helpers/test-utils'

import Metrics from './Metrics'

jest.mock('src/api/explat/MetricsApi')
const mockedMetricsApi = MetricsApi as unknown as jest.Mocked<typeof MetricsApi>

const archivedMetricName = 'archived_stuff'
const debugMetricName = 'explat_test_stuff'
const metrics = [
  Fixtures.createMetric(1),
  Fixtures.createMetric(2, {
    name: archivedMetricName,
  }),
  Fixtures.createMetric(3, {
    name: debugMetricName,
  }),
]

describe('Metris page', () => {
  beforeEach(() => {
    mockedMetricsApi.findAll.mockResolvedValueOnce(metrics)
  })

  it('renders metrics filtring out the archived and debug metrics', async () => {
    render(<Metrics />)
    await waitFor(() => screen.getByText(/metric_1/))

    expect(screen.queryByText(new RegExp(archivedMetricName))).toBeNull()
    expect(screen.queryByText(new RegExp(debugMetricName))).toBeNull()
  })

  it('renders a toggle to show/hide archived metrics', async () => {
    render(<Metrics />)
    await waitFor(() => screen.getByText(/metric_1/))

    screen.getByRole('checkbox', { name: /Show archived metrics/ }).click()
    expect(screen.queryByText(new RegExp(archivedMetricName))).toBeVisible()

    screen.getByRole('checkbox', { name: /Show archived metrics/ }).click()
    expect(screen.queryByText(new RegExp(archivedMetricName))).toBeNull()
  })

  it('renders a toggle to show/hide debug metrics', async () => {
    render(<Metrics />)
    await waitFor(() => screen.getByText(/metric_1/))

    screen.getByRole('checkbox', { name: /Show debug metrics/ }).click()
    expect(screen.queryByText(new RegExp(debugMetricName))).toBeVisible()

    screen.getByRole('checkbox', { name: /Show debug metrics/ }).click()
    expect(screen.queryByText(new RegExp(debugMetricName))).toBeNull()
  })
})
