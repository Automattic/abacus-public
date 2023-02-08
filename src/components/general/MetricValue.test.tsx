/* eslint-disable no-irregular-whitespace */
import React from 'react'

import { UnitType } from 'src/lib/explat/metrics'
import { render } from 'src/test-helpers/test-utils'
import { abbreviateNumber } from 'src/utils/formatters'

import MetricValue from './MetricValue'

test('renders metric values', () => {
  expect(render(<MetricValue value={1} unit={UnitType.Proportion} />).container).toMatchInlineSnapshot(`
    <div>
      
      100
      %
    </div>
  `)
  expect(render(<MetricValue value={0.01} unit={UnitType.Proportion} />).container).toMatchInlineSnapshot(`
    <div>
      
      1
      %
    </div>
  `)
  expect(render(<MetricValue value={0.123456789} unit={UnitType.Proportion} />).container).toMatchInlineSnapshot(`
    <div>
      
      12.35
      %
    </div>
  `)
  expect(render(<MetricValue value={1} unit={UnitType.RatioPoints} />).container).toMatchInlineSnapshot(`
    <div>
      
      100
      <span
        class="makeStyles-tooltipped-1"
        title="Percentage points."
      >
        pp
      </span>
    </div>
  `)
  expect(render(<MetricValue value={0.01} unit={UnitType.RatioPoints} />).container).toMatchInlineSnapshot(`
    <div>
      
      1
      <span
        class="makeStyles-tooltipped-1"
        title="Percentage points."
      >
        pp
      </span>
    </div>
  `)
  expect(render(<MetricValue value={0.123456789} unit={UnitType.RatioPoints} />).container).toMatchInlineSnapshot(`
    <div>
      
      12.35
      <span
        class="makeStyles-tooltipped-1"
        title="Percentage points."
      >
        pp
      </span>
    </div>
  `)

  expect(render(<MetricValue value={1} unit={UnitType.Usd} />).container).toMatchInlineSnapshot(`
    <div>
      
      1.00
       USD
    </div>
  `)
  expect(render(<MetricValue value={0.01} unit={UnitType.Usd} />).container).toMatchInlineSnapshot(`
    <div>
      
      0.01
       USD
    </div>
  `)
  expect(render(<MetricValue value={0.123456789} unit={UnitType.Usd} />).container).toMatchInlineSnapshot(`
    <div>
      
      0.12
       USD
    </div>
  `)
  expect(render(<MetricValue value={1} unit={UnitType.Usd} />).container).toMatchInlineSnapshot(`
    <div>
      
      1.00
       USD
    </div>
  `)
  expect(render(<MetricValue value={0.01} unit={UnitType.Usd} />).container).toMatchInlineSnapshot(`
    <div>
      
      0.01
       USD
    </div>
  `)
  expect(render(<MetricValue value={0.123456789} unit={UnitType.Usd} />).container).toMatchInlineSnapshot(`
    <div>
      
      0.12
       USD
    </div>
  `)

  expect(render(<MetricValue value={1200} unit={UnitType.Usd} formatter={abbreviateNumber} />).container)
    .toMatchInlineSnapshot(`
    <div>
      
      1.2K
       USD
    </div>
  `)
  expect(render(<MetricValue value={1200000} unit={UnitType.Proportion} formatter={abbreviateNumber} />).container)
    .toMatchInlineSnapshot(`
    <div>
      
      120M
      %
    </div>
  `)
})
