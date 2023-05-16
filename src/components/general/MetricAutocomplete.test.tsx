import { screen } from '@testing-library/react'
import { Formik } from 'formik'
import React from 'react'

import MetricAutocomplete from 'src/components/general/MetricAutocomplete'
import { indexMetrics } from 'src/lib/explat/normalizers'
import Fixtures from 'src/test-helpers/fixtures'
import { openMetricAutocomplete, render } from 'src/test-helpers/test-utils'
import { toggleDebugMode } from 'src/utils/general'

describe('MetricAutocomplete', () => {
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
  const options = Object.values(indexMetrics(metrics))

  it('renders successfully ', async () => {
    render(
      <Formik
        initialValues={{ name: '' }}
        /* istanbul ignore next; This is unused */
        onSubmit={() => undefined}
      >
        <MetricAutocomplete id={`metricAssignment.metricId`} onChange={jest.fn()} options={options} fullWidth />
      </Formik>,
    )

    openMetricAutocomplete()
    expect(screen.queryByRole('option', { name: /metric_1/ })).toBeVisible()
  })

  it('filters out archived and debug metrics', async () => {
    render(
      <Formik
        initialValues={{ name: '' }}
        /* istanbul ignore next; This is unused */
        onSubmit={() => undefined}
      >
        <MetricAutocomplete id={`metricAssignment.metricId`} onChange={jest.fn()} options={options} fullWidth />
      </Formik>,
    )

    openMetricAutocomplete()
    expect(screen.queryByRole('option', { name: new RegExp(archivedMetricName) })).toBeNull()
    expect(screen.queryByRole('option', { name: new RegExp(debugMetricName) })).toBeNull()
  })

  it('includes debug metrics in debug mode', async () => {
    toggleDebugMode()

    render(
      <Formik
        initialValues={{ name: '' }}
        /* istanbul ignore next; This is unused */
        onSubmit={() => undefined}
      >
        <MetricAutocomplete id={`metricAssignment.metricId`} onChange={jest.fn()} options={options} fullWidth />
      </Formik>,
    )
    openMetricAutocomplete()
    expect(screen.queryByRole('option', { name: new RegExp(debugMetricName) })).toBeVisible()

    toggleDebugMode()
  })
})
