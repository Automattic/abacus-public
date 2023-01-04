import React from 'react'

import Fixtures from '../../../../test-helpers/fixtures'
import MetricsTable from './MetricsTable'

export default { title: 'MetricsTable' }
export const withNoMetrics = (): JSX.Element => <MetricsTable metrics={[]} />
export const withFewMetrics = (): JSX.Element => <MetricsTable metrics={Fixtures.createMetrics(4)} />
export const withManyMetrics = (): JSX.Element => <MetricsTable metrics={Fixtures.createMetrics(40)} />

export const includesMetricWithLongName = (): JSX.Element => (
  <div style={{ maxWidth: 1000 }}>
    <MetricsTable
      metrics={[
        Fixtures.createMetric(1, { name: 'archived_prefix_domain_metric_with_super_extra_long_name_6_02_2022' }),
        ...Fixtures.createMetrics(4),
      ]}
    />
  </div>
)

export const includesMetricWithLongDescription = (): JSX.Element => (
  <div style={{ maxWidth: 1000 }}>
    <MetricsTable
      metrics={[
        Fixtures.createMetric(1, {
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec turpis elementum, vehicula libero at, blandit quam. Vivamus semper tellus ac egestas laoreet. Maecenas laoreet rutrum aliquet. Quisque nec eros leo.',
        }),
        ...Fixtures.createMetrics(4),
      ]}
    />
  </div>
)

export const includesMetricWithLongNameAndDescription = (): JSX.Element => (
  <div style={{ maxWidth: 1000 }}>
    <MetricsTable
      metrics={[
        Fixtures.createMetric(1, {
          name: 'archived_prefix_domain_metric_with_super_extra_long_name_6_02_2022',
          description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla nec turpis elementum, vehicula libero at, blandit quam. Vivamus semper tellus ac egestas laoreet. Maecenas laoreet rutrum aliquet. Quisque nec eros leo.',
        }),
        ...Fixtures.createMetrics(4),
      ]}
    />
  </div>
)
