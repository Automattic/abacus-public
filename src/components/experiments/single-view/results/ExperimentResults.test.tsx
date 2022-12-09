import { act, fireEvent, getAllByText, getByText, screen, waitFor } from '@testing-library/react'
import React from 'react'
import Plot from 'react-plotly.js'

import ExperimentResults, {
  METRIC_DETAILS_AUTO_EXPAND_DELAY,
} from 'src/components/experiments/single-view/results/ExperimentResults'
import { AnalysisStrategy, MetricParameterType, Platform, Status } from 'src/lib/schemas'
import Fixtures from 'src/test-helpers/fixtures'
import { changeAnalysisStrategy, changeEstimatedImpactInterval, render } from 'src/test-helpers/test-utils'
import { toggleDebugMode } from 'src/utils/general'

// Unfortunately Plotly doesn't produce graphs with deterministic IDs so we have to mock it
jest.mock('react-plotly.js')
const mockedPlot = Plot as jest.MockedClass<typeof Plot>
beforeEach(() => {
  mockedPlot.mockClear()
  jest.useFakeTimers()
})

const experiment = Fixtures.createExperimentFull({
  startDatetime: new Date('2021-04-01T00:00:00Z'),
  endDatetime: new Date('2021-04-11T00:00:00Z'),
  status: Status.Completed,
})
const metrics = Fixtures.createMetrics()
const analyses = Fixtures.createAnalyses()

test('renders an appropriate message with no analyses', async () => {
  const { container } = render(<ExperimentResults analyses={[]} experiment={experiment} metrics={metrics} />)
  expect(container).toMatchSnapshot()
  await expect(container.textContent).toMatch('No results are available at the moment')
})

test('renders an appropriate message for analyses missing analysis data due to an ETL bug', async () => {
  const { container } = render(
    <ExperimentResults
      analyses={[
        Fixtures.createAnalysis({
          analysisStrategy: AnalysisStrategy.PpNaive,
          metricEstimates: null,
        }),
      ]}
      experiment={experiment}
      metrics={metrics}
    />,
  )
  expect(container).toMatchSnapshot()
  await expect(container.textContent).toMatch('Not analyzed yet')
})

test('renders correctly for 1 analysis datapoint, not statistically significant', async () => {
  const metricEstimates = {
    variations: {
      '1': Fixtures.createDistributionStats({
        top_95: 1,
        bottom_95: 0.5,
        mean: 1,
      }),
      '2': Fixtures.createDistributionStats({
        top_95: 1,
        bottom_95: 0.5,
        mean: 1,
      }),
    },
    diffs: {
      '2_1': Fixtures.createDistributionStats({
        top_95: 1,
        bottom_95: -1,
        mean: 0,
      }),
      '1_2': Fixtures.createDistributionStats({
        top_95: 0,
        bottom_95: 0,
        mean: 0,
      }),
    },
    ratios: {
      '2_1': Fixtures.createDistributionStats({
        top_95: 1,
        bottom_95: 0.5,
        mean: 0,
      }),
      '1_2': Fixtures.createDistributionStats({
        top_95: 0,
        bottom_95: 0,
        mean: 0,
      }),
    },
  }
  const { container } = render(
    <ExperimentResults
      analyses={[
        Fixtures.createAnalysis({ analysisStrategy: AnalysisStrategy.PpNaive, metricEstimates }),
        Fixtures.createAnalysis({ analysisStrategy: AnalysisStrategy.IttPure, metricEstimates }),
        Fixtures.createAnalysis({ analysisStrategy: AnalysisStrategy.MittNoCrossovers, metricEstimates }),
        Fixtures.createAnalysis({ analysisStrategy: AnalysisStrategy.MittNoSpammers, metricEstimates }),
        Fixtures.createAnalysis({
          analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
          metricEstimates,
        }),
      ]}
      experiment={experiment}
      metrics={metrics}
    />,
  )

  // Check the table snapshot before expanding any metric.
  expect(container.querySelector('.analysis-latest-results')).toMatchSnapshot()

  // Clicking on metric_1 or metric_2 should have no effect on anything, but metric_3 should render the details.
  fireEvent.click(getByText(container, /metric_1/))
  fireEvent.click(getAllByText(container, /metric_2/)[0])
  fireEvent.click(getByText(container, /metric_3/))
  await waitFor(() => getByText(container, /Last analyzed/), { container })
  expect(container.querySelector('.analysis-latest-results .analysis-detail-panel')).toMatchSnapshot()

  expect(mockedPlot).toMatchSnapshot()
})

test('A/B/n: renders correctly for 1 analysis datapoint, not statistically significant', async () => {
  const experiment = Fixtures.createExperimentFull({
    variations: [
      Fixtures.createVariation({
        variationId: 1,
        name: 'control',
        isDefault: true,
        allocatedPercentage: 40,
      }),
      Fixtures.createVariation({
        variationId: 2,
        name: 'treatment1',
        isDefault: false,
        allocatedPercentage: 40,
      }),
      Fixtures.createVariation({
        variationId: 3,
        name: 'treatment2',
        isDefault: false,
        allocatedPercentage: 20,
      }),
    ],
  })
  const { container } = render(
    <ExperimentResults
      analyses={[
        Fixtures.createMultiVariationAnalysis({ analysisStrategy: AnalysisStrategy.PpNaive }),
        Fixtures.createMultiVariationAnalysis({ analysisStrategy: AnalysisStrategy.IttPure }),
        Fixtures.createMultiVariationAnalysis({ analysisStrategy: AnalysisStrategy.MittNoCrossovers }),
        Fixtures.createMultiVariationAnalysis({ analysisStrategy: AnalysisStrategy.MittNoSpammers }),
        Fixtures.createMultiVariationAnalysis({
          analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
        }),
      ]}
      experiment={experiment}
      metrics={metrics}
    />,
  )

  // Check the table snapshot before expanding any metric.
  expect(container.querySelector('.analysis-latest-results')).toMatchSnapshot()

  // Clicking on metric_1 or metric_2 should have no effect on anything, but metric_3 should render the details.
  fireEvent.click(getByText(container, /metric_1/))
  fireEvent.click(getAllByText(container, /metric_2/)[0])
  fireEvent.click(getByText(container, /metric_3/))
  await waitFor(() => getByText(container, /Last analyzed/), { container })
  expect(container.querySelector('.analysis-latest-results .analysis-detail-panel')).toMatchSnapshot()

  expect(mockedPlot).toMatchSnapshot()

  const baseVariationField = screen.getByRole('button', { name: /Base Variation/ })
  const changeVariationField = screen.getByRole('button', { name: /Change Variation/ })

  await act(async () => {
    fireEvent.focus(baseVariationField)
  })
  await act(async () => {
    fireEvent.keyDown(baseVariationField, { key: 'Enter' })
  })
  await act(async () => {
    fireEvent.click(await screen.findByRole('option', { name: /treatment1/ }))
  })

  await act(async () => {
    fireEvent.focus(changeVariationField)
  })
  await act(async () => {
    fireEvent.keyDown(changeVariationField, { key: 'Enter' })
  })
  await act(async () => {
    fireEvent.click(await screen.findByRole('option', { name: /treatment2/ }))
  })

  // Triggering the second select to not change when it matches the first select:
  await act(async () => {
    fireEvent.focus(changeVariationField)
  })
  await act(async () => {
    fireEvent.keyDown(baseVariationField, { key: 'Enter' })
  })
  await act(async () => {
    fireEvent.click(await screen.findByRole('option', { name: /control/ }))
  })

  expect(container.querySelector('.analysis-latest-results')).toMatchSnapshot()
})

test('renders correctly for 1 analysis datapoint, statistically significant', async () => {
  const metricEstimates = {
    variations: {
      '1': Fixtures.createDistributionStats({
        top_95: 2,
        bottom_95: 1,
        mean: 1,
      }),
      '2': Fixtures.createDistributionStats({
        top_95: 1,
        bottom_95: 0.5,
        mean: 1,
      }),
    },
    diffs: {
      '2_1': Fixtures.createDistributionStats({
        top_95: 1,
        bottom_95: 0.5,
        mean: 0,
      }),
      '1_2': Fixtures.createDistributionStats({
        top_95: 0,
        bottom_95: 0,
        mean: 0,
      }),
    },
    ratios: {
      '2_1': Fixtures.createDistributionStats({
        top_95: 1,
        bottom_95: 0.5,
        mean: 0,
      }),
      '1_2': Fixtures.createDistributionStats({
        top_95: 0,
        bottom_95: 0,
        mean: 0,
      }),
    },
  }
  const { container } = render(
    <ExperimentResults
      analyses={[
        Fixtures.createAnalysis({ analysisStrategy: AnalysisStrategy.PpNaive, metricEstimates }),
        Fixtures.createAnalysis({ analysisStrategy: AnalysisStrategy.IttPure, metricEstimates }),
        Fixtures.createAnalysis({ analysisStrategy: AnalysisStrategy.MittNoCrossovers, metricEstimates }),
        Fixtures.createAnalysis({ analysisStrategy: AnalysisStrategy.MittNoSpammers, metricEstimates }),
        Fixtures.createAnalysis({
          analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
          metricEstimates,
        }),
      ]}
      experiment={experiment}
      metrics={metrics}
    />,
  )

  // Check the table snapshot before expanding any metric.
  expect(container.querySelector('.analysis-latest-results')).toMatchSnapshot()

  // Clicking on metric_1 or metric_2 should have no effect on anything, but metric_3 should render the details.
  fireEvent.click(getByText(container, /metric_1/))
  fireEvent.click(getAllByText(container, /metric_2/)[0])
  fireEvent.click(getByText(container, /metric_3/))
  await waitFor(() => getByText(container, /Last analyzed/), { container })
  expect(container.querySelector('.analysis-latest-results .analysis-detail-panel')).toMatchSnapshot()

  expect(mockedPlot).toMatchSnapshot()
})

test('renders correctly for conflicting analysis data', async () => {
  toggleDebugMode()

  const metricEstimates1 = {
    variations: {
      '1': Fixtures.createDistributionStats({
        top_95: 2,
        bottom_95: 1,
        mean: 1,
      }),
      '2': Fixtures.createDistributionStats({
        top_95: 1,
        bottom_95: 0.5,
        mean: 1,
      }),
    },
    diffs: {
      '2_1': Fixtures.createDistributionStats({
        top_95: 1,
        bottom_95: 0.5,
        mean: 0,
      }),
      '1_2': Fixtures.createDistributionStats({
        top_95: 0,
        bottom_95: 0,
        mean: 0,
      }),
    },
    ratios: {
      '2_1': Fixtures.createDistributionStats({
        top_95: 1,
        bottom_95: 0.5,
        mean: 0,
      }),
      '1_2': Fixtures.createDistributionStats({
        top_95: 0,
        bottom_95: 0,
        mean: 0,
      }),
    },
  }
  const metricEstimates2 = {
    variations: {
      '1': Fixtures.createDistributionStats({
        top_95: 2,
        bottom_95: 1,
        mean: 1,
      }),
      '2': Fixtures.createDistributionStats({
        top_95: 1,
        bottom_95: 0.5,
        mean: 1,
      }),
    },
    diffs: {
      '2_1': Fixtures.createDistributionStats({
        top_95: -1,
        bottom_95: -2,
        mean: -1.4,
      }),
      '1_2': Fixtures.createDistributionStats({
        top_95: 0,
        bottom_95: 0,
        mean: 0,
      }),
    },
    ratios: {
      '2_1': Fixtures.createDistributionStats({
        top_95: 1,
        bottom_95: 0.5,
        mean: 0,
      }),
      '1_2': Fixtures.createDistributionStats({
        top_95: 0,
        bottom_95: 0,
        mean: 0,
      }),
    },
  }

  const { container } = render(
    <ExperimentResults
      analyses={[
        Fixtures.createAnalysis({
          analysisStrategy: AnalysisStrategy.PpNaive,
          metricEstimates: metricEstimates1,
        }),
        Fixtures.createAnalysis({
          analysisStrategy: AnalysisStrategy.IttPure,
          metricEstimates: metricEstimates2,
        }),
        Fixtures.createAnalysis({
          analysisStrategy: AnalysisStrategy.MittNoCrossovers,
          metricEstimates: metricEstimates2,
        }),
        Fixtures.createAnalysis({
          analysisStrategy: AnalysisStrategy.MittNoSpammers,
          metricEstimates: metricEstimates2,
        }),
        Fixtures.createAnalysis({
          analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers,
          metricEstimates: metricEstimates2,
        }),
      ]}
      experiment={experiment}
      metrics={metrics}
    />,
  )

  // Check the table snapshot before expanding any metric.
  expect(container.querySelector('.analysis-latest-results')).toMatchSnapshot()

  // Clicking on metric_1 or metric_2 should have no effect on anything, but metric_3 should render the details.
  fireEvent.click(getByText(container, /metric_1/))
  fireEvent.click(getAllByText(container, /metric_2/)[0])
  fireEvent.click(getByText(container, /metric_3/))
  await waitFor(() => getByText(container, /Last analyzed/), { container })
  expect(container.querySelector('.analysis-latest-results .analysis-detail-panel')).toMatchSnapshot()

  expect(mockedPlot).toMatchSnapshot()

  toggleDebugMode()
})

test('renders the condensed table with some analyses in non-debug mode for a Conversion Metric', async () => {
  const { container } = render(<ExperimentResults analyses={analyses} experiment={experiment} metrics={metrics} />)

  // In non-debug mode, we shouldn't have a <pre> element with the JSON.
  expect(container.querySelector('.debug-json')).toBeNull()

  // Check the table snapshot before expanding any metric.
  expect(container.querySelector('.analysis-latest-results')).toMatchSnapshot()

  // Clicking on metric_1 or metric_2 should have no effect on anything, but metric_3 should render the details.
  fireEvent.click(getByText(container, /metric_1/))
  fireEvent.click(getAllByText(container, /metric_2/)[0])
  fireEvent.click(getByText(container, /metric_3/))
  await waitFor(() => getAllByText(container, /Last analyzed/), { container })
  expect(container.querySelector('.analysis-latest-results .analysis-detail-panel')).toMatchSnapshot()
  fireEvent.click(screen.getAllByRole('button', { name: /"Observed" data/ })[0])
  fireEvent.click(screen.getAllByRole('button', { name: /All credible intervals/ })[0])

  expect(mockedPlot).toMatchSnapshot()
})

test('renders the condensed table with some analyses in non-debug mode for a Revenue Metric', async () => {
  const metrics = Fixtures.createMetrics().map((metric) => ({
    ...metric,
    parameterType: MetricParameterType.Revenue,
  }))

  const { container } = render(<ExperimentResults analyses={analyses} experiment={experiment} metrics={metrics} />)

  // In non-debug mode, we shouldn't have a <pre> element with the JSON.
  expect(container.querySelector('.debug-json')).toBeNull()

  // Check the table snapshot before expanding any metric.
  expect(container.querySelector('.analysis-latest-results')).toMatchSnapshot()

  // Clicking on metric_1 or metric_2 should have no effect on anything, but metric_3 should render the details.
  fireEvent.click(getByText(container, /metric_1/))
  fireEvent.click(getAllByText(container, /metric_2/)[0])
  fireEvent.click(getByText(container, /metric_3/))
  await waitFor(() => getAllByText(container, /Last analyzed/), { container })
  expect(container.querySelector('.analysis-latest-results .analysis-detail-panel')).toMatchSnapshot()
  fireEvent.click(screen.getAllByRole('button', { name: /"Observed" data/ })[0])

  expect(mockedPlot).toMatchSnapshot()
})

test('allows you to change analysis strategy', async () => {
  const { container } = render(
    <ExperimentResults
      analyses={[
        Fixtures.createAnalysis({ analysisStrategy: AnalysisStrategy.IttPure }),
        Fixtures.createAnalysis({ analysisStrategy: AnalysisStrategy.MittNoCrossovers }),
        Fixtures.createAnalysis({ analysisStrategy: AnalysisStrategy.MittNoSpammers }),
        Fixtures.createAnalysis({ analysisStrategy: AnalysisStrategy.MittNoSpammersNoCrossovers }),
      ]}
      experiment={{ ...experiment, exposureEvents: undefined }}
      metrics={metrics}
    />,
  )

  await changeAnalysisStrategy()

  expect(container).toMatchSnapshot()
})

test('opens the primary metric DetailPanel automatically after a predefined delay', async () => {
  render(<ExperimentResults analyses={analyses} experiment={experiment} metrics={metrics} />)

  expect(screen.queryByText(/Last analyzed/)).toBeNull()

  // Fast-forward until the delay has been executed
  jest.advanceTimersByTime(METRIC_DETAILS_AUTO_EXPAND_DELAY)
  expect(screen.queryByText(/This is metric 1/)).toBeTruthy()

  // Opening another panel should work
  fireEvent.click(screen.getByText(/metric_3/))
  expect(screen.queryByText(/This is metric 3/)).toBeTruthy()
  expect(screen.getAllByText(/Last analyzed/)).toHaveLength(2)

  // Closing the automatically opened panel should work
  fireEvent.click(screen.getByText(/metric_1/))
  expect(screen.queryByText(/This is metric 1/)).toBeNull()
  expect(screen.getAllByText(/Last analyzed/)).toHaveLength(1)
})

test('prevents opening the primary metric DetailPanel automatically if the user has already opened a DetailPanel', async () => {
  render(<ExperimentResults analyses={analyses} experiment={experiment} metrics={metrics} />)

  fireEvent.click(screen.getByText(/metric_3/))
  expect(screen.queryByText(/This is metric 3/)).toBeTruthy()
  expect(screen.getAllByText(/Last analyzed/)).toHaveLength(1)

  jest.advanceTimersByTime(METRIC_DETAILS_AUTO_EXPAND_DELAY)

  expect(screen.queryByText(/This is metric 1/)).toBeNull()
  expect(screen.getAllByText(/Last analyzed/)).toHaveLength(1)
})

test('preserve the last open state for Detail Panel when changing the analysis strategy', async () => {
  render(<ExperimentResults analyses={analyses} experiment={experiment} metrics={metrics} />)

  // Fast-forward until the delay has been executed
  jest.advanceTimersByTime(METRIC_DETAILS_AUTO_EXPAND_DELAY)
  expect(screen.queryByText(/This is metric 1/)).toBeTruthy()

  // close the panel
  fireEvent.click(screen.getByText(/metric_1/))
  expect(screen.queryByText(/This is metric 1/)).toBeNull()

  // change the Analysis Strategy
  await changeAnalysisStrategy()
  expect(screen.queryByText(/This is metric 1/)).toBeNull()
})

test('prevent closing the Detail Panel when changing the analysis strategy', async () => {
  render(<ExperimentResults analyses={analyses} experiment={experiment} metrics={metrics} />)

  // open the panel
  fireEvent.click(screen.getByText(/metric_3/))
  expect(screen.queryByText(/This is metric 3/)).toBeTruthy()

  // change the Analysis Strategy
  await changeAnalysisStrategy()
  expect(screen.queryByText(/This is metric 3/)).toBeTruthy()
})

test('renders correctly the estimated impact interval and selector', async () => {
  render(<ExperimentResults analyses={analyses} experiment={experiment} metrics={metrics} />)

  // Default yearly interval is selected
  expect(screen.queryAllByRole('row', { name: /over one year/ }).length).toBeGreaterThanOrEqual(1)

  // Selecting monthly interval for estimated impact should work
  await changeEstimatedImpactInterval(12, 1)

  expect(screen.queryByRole('row', { name: /over one year/ })).toBeNull()
  expect(screen.queryAllByRole('row', { name: /over one month/ }).length).toBeGreaterThanOrEqual(1)
})

test('renders correctly a one time experiment', async () => {
  const experiment = Fixtures.createExperimentFull({
    platform: Platform.Email,
  })
  render(<ExperimentResults analyses={analyses} experiment={experiment} metrics={metrics} />)

  expect(screen.queryByRole('row', { name: /over one year/ })).toBeNull()
  expect(screen.queryAllByRole('row', { name: /on the entire targeted audience/ }).length).toBeGreaterThanOrEqual(1)
})
