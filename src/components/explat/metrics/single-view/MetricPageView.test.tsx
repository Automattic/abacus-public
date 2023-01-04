import { screen, waitFor } from '@testing-library/react'
import React from 'react'

import MetricsApi from 'src/api/explat/MetricsApi'
import Fixtures from 'src/test-helpers/fixtures'
import { render } from 'src/test-helpers/test-utils'

import MetricPageView from './MetricPageView'

jest.mock('src/api/explat/MetricsApi')
const mockedMetricsApi = MetricsApi as unknown as jest.Mocked<typeof MetricsApi>
const metric = Fixtures.createMetric(1)

describe('MetricPageView', () => {
  it('renders page label and placeholder when loading', () => {
    render(<MetricPageView metricId={1} />)

    screen.getByText(/Metric:/)
    screen.getByRole(/placeholder/)
  })

  it('with a metric, renders metric name in title', async () => {
    mockedMetricsApi.findById.mockResolvedValueOnce(metric)
    render(<MetricPageView metricId={1} />)
    const placeholder = screen.getByRole(/placeholder/)
    await waitFor(() => !placeholder)
    screen.getByRole(/heading/, { name: `Metric: ${metric.name} Copy` })
  })

  it('with a metric, loads and renders metric details', async () => {
    mockedMetricsApi.findById.mockResolvedValueOnce(metric)
    render(<MetricPageView metricId={1} />)

    await waitFor(() => screen.getByRole(/progressbar/))
    await waitFor(() => screen.queryByText(/Description/))
    screen.getByText(metric.description)
  })
})
