import _ from 'lodash'
import React from 'react'

import MetricsApi from 'src/api/explat/MetricsApi'
import PageTitleWithSlug from 'src/components/general/PageTitleWithSlug'
import { useDataLoadingError, useDataSource } from 'src/utils/data-loading'

import MetricDetails from '../MetricDetails'

export default function MetricPageView({ metricId }: { metricId: number; isCompact?: boolean }): JSX.Element {
  const { isLoading, data: metric, error } = useDataSource(() => MetricsApi.findById(metricId), [metricId])
  useDataLoadingError(error)

  const isReady = !isLoading && !error

  return (
    <>
      <PageTitleWithSlug label='Metric' slug={metric?.name || ''} isSlugLoading={!isReady} />
      <MetricDetails metric={metric || undefined} isLoading={!isReady} />
    </>
  )
}
