import debugFactory from 'debug'
import React from 'react'
import { useParams } from 'react-router-dom'

import MetricPageView from 'src/components/explat/metrics/single-view/MetricPageView'
import Layout from 'src/components/page-parts/Layout'
import { parseIdSlug } from 'src/utils/general'

const debug = debugFactory('abacus:pages/experiments/Metric.tsx')

const Metric = function (): JSX.Element {
  debug('MetricPage#render')

  const { metricIdSlug } = useParams<{ metricIdSlug: string }>()
  const metricId = parseIdSlug(metricIdSlug)
  return (
    <Layout flexContent>
      <MetricPageView metricId={Number(metricId)} />
    </Layout>
  )
}

export default Metric
