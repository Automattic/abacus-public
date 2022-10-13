/* eslint-disable @typescript-eslint/require-await, no-irregular-whitespace */
import { fireEvent, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import { noop } from 'lodash'
import React from 'react'

import { Status } from 'src/lib/schemas'
import Fixtures from 'src/test-helpers/fixtures'
import { render } from 'src/test-helpers/test-utils'

import { fillMetricAssignmentForm } from '../../MetricAssignmentForm.test'
import MetricAssignmentsPanel from './MetricAssignmentsPanel'

test('renders as expected with all metrics resolvable', () => {
  const metrics = Fixtures.createMetrics()
  const experiment = Fixtures.createExperimentFull()
  const experimentReloadRef: React.MutableRefObject<() => void> = { current: noop }
  const { container } = render(<MetricAssignmentsPanel {...{ experiment, metrics, experimentReloadRef }} />)

  expect(container).toMatchInlineSnapshot(`
    <div>
      <div
        class="MuiPaper-root MuiPaper-elevation1 MuiPaper-rounded"
      >
        <div
          class="MuiToolbar-root MuiToolbar-regular MuiToolbar-gutters"
        >
          <h3
            class="MuiTypography-root makeStyles-title-34 MuiTypography-h3 MuiTypography-colorTextPrimary"
          >
            Metrics
          </h3>
          <div
            class=""
            title="Use \\"Edit in Wizard\\" for staging experiments."
          >
            <button
              class="MuiButtonBase-root MuiButton-root MuiButton-outlined Mui-disabled Mui-disabled"
              disabled=""
              tabindex="-1"
              type="button"
            >
              <span
                class="MuiButton-label"
              >
                <svg
                  aria-hidden="true"
                  class="MuiSvgIcon-root"
                  focusable="false"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                  />
                </svg>
                Assign Metric
              </span>
            </button>
          </div>
        </div>
        <table
          class="MuiTable-root makeStyles-metricsTable-35"
        >
          <thead
            class="MuiTableHead-root"
          >
            <tr
              class="MuiTableRow-root MuiTableRow-head"
            >
              <th
                class="MuiTableCell-root MuiTableCell-head"
                role="columnheader"
                scope="col"
              >
                Name
              </th>
              <th
                class="MuiTableCell-root MuiTableCell-head makeStyles-smallColumn-37"
                role="columnheader"
                scope="col"
              >
                Attribution Window
              </th>
              <th
                class="MuiTableCell-root MuiTableCell-head makeStyles-smallColumn-37"
                role="columnheader"
                scope="col"
              >
                Changes Expected
              </th>
              <th
                class="MuiTableCell-root MuiTableCell-head makeStyles-smallColumn-37"
                role="columnheader"
                scope="col"
              >
                Minimum Difference
              </th>
            </tr>
          </thead>
          <tbody
            class="MuiTableBody-root"
          >
            <tr
              class="MuiTableRow-root"
            >
              <td
                class="MuiTableCell-root MuiTableCell-body"
              >
                <strong
                  class="makeStyles-monospace-33 makeStyles-metricName-38"
                  title="metric_1"
                >
                  metric_1
                </strong>
                <br />
                <small
                  class="makeStyles-monospace-33"
                >
                  This is metric 1
                </small>
                <br />
                <span
                  class="makeStyles-root-40"
                >
                  primary
                </span>
              </td>
              <td
                class="MuiTableCell-root MuiTableCell-body makeStyles-monospace-33"
              >
                1 week
              </td>
              <td
                class="MuiTableCell-root MuiTableCell-body makeStyles-monospace-33"
              >
                Yes
              </td>
              <td
                class="MuiTableCell-root MuiTableCell-body makeStyles-monospace-33"
              >
                
                10
                <span
                  class="makeStyles-tooltipped-41"
                  title="Percentage points."
                >
                  pp
                </span>
              </td>
            </tr>
            <tr
              class="MuiTableRow-root"
            >
              <td
                class="MuiTableCell-root MuiTableCell-body"
              >
                <strong
                  class="makeStyles-monospace-33 makeStyles-metricName-38"
                  title="metric_2"
                >
                  metric_2
                </strong>
                <br />
                <small
                  class="makeStyles-monospace-33"
                >
                  This is metric 2
                </small>
                <br />
              </td>
              <td
                class="MuiTableCell-root MuiTableCell-body makeStyles-monospace-33"
              >
                1 hour
              </td>
              <td
                class="MuiTableCell-root MuiTableCell-body makeStyles-monospace-33"
              >
                Yes
              </td>
              <td
                class="MuiTableCell-root MuiTableCell-body makeStyles-monospace-33"
              >
                
                0.50
                 USD
              </td>
            </tr>
            <tr
              class="MuiTableRow-root"
            >
              <td
                class="MuiTableCell-root MuiTableCell-body"
              >
                <strong
                  class="makeStyles-monospace-33 makeStyles-metricName-38"
                  title="metric_2"
                >
                  metric_2
                </strong>
                <br />
                <small
                  class="makeStyles-monospace-33"
                >
                  This is metric 2
                </small>
                <br />
              </td>
              <td
                class="MuiTableCell-root MuiTableCell-body makeStyles-monospace-33"
              >
                4 weeks
              </td>
              <td
                class="MuiTableCell-root MuiTableCell-body makeStyles-monospace-33"
              >
                No
              </td>
              <td
                class="MuiTableCell-root MuiTableCell-body makeStyles-monospace-33"
              >
                
                10.50
                 USD
              </td>
            </tr>
            <tr
              class="MuiTableRow-root"
            >
              <td
                class="MuiTableCell-root MuiTableCell-body"
              >
                <strong
                  class="makeStyles-monospace-33 makeStyles-metricName-38"
                  title="metric_3"
                >
                  metric_3
                </strong>
                <br />
                <small
                  class="makeStyles-monospace-33"
                >
                  This is metric 3
                </small>
                <br />
              </td>
              <td
                class="MuiTableCell-root MuiTableCell-body makeStyles-monospace-33"
              >
                6 hours
              </td>
              <td
                class="MuiTableCell-root MuiTableCell-body makeStyles-monospace-33"
              >
                Yes
              </td>
              <td
                class="MuiTableCell-root MuiTableCell-body makeStyles-monospace-33"
              >
                
                1200
                <span
                  class="makeStyles-tooltipped-41"
                  title="Percentage points."
                >
                  pp
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `)
})

test('throws an error when some metrics not resolvable', () => {
  const metrics = Fixtures.createMetrics(1)
  const experiment = Fixtures.createExperimentFull()
  const experimentReloadRef: React.MutableRefObject<() => void> = { current: noop }

  // Note: This console.error spy is mainly used to suppress the output that the
  // `render` function outputs.
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const consoleErrorSpy = jest.spyOn(global.console, 'error').mockImplementation(() => {})
  try {
    render(<MetricAssignmentsPanel {...{ experiment, metrics, experimentReloadRef }} />)
    expect(false).toBe(true) // Should never be reached
  } catch (err) {
    expect(consoleErrorSpy).toHaveBeenCalled()
  } finally {
    consoleErrorSpy.mockRestore()
  }
})

test('opens, submits, and cancels assign metric dialog', async () => {
  const metrics = Fixtures.createMetrics(5)
  const experiment = Fixtures.createExperimentFull({ status: Status.Running })
  const experimentReloadRef: React.MutableRefObject<() => void> = { current: noop }
  render(<MetricAssignmentsPanel {...{ experiment, metrics, experimentReloadRef }} />)

  const startAssignButton = screen.getByRole('button', { name: /Assign Metric/ })
  fireEvent.click(startAssignButton)

  await waitFor(() => screen.getByRole('button', { name: /Assign/ }))
  const assignButton = screen.getByRole('button', { name: /Assign/ })
  await fillMetricAssignmentForm()
  fireEvent.click(assignButton)
  expect(waitForElementToBeRemoved(assignButton))

  fireEvent.click(startAssignButton)
  await waitFor(() => screen.getByRole('button', { name: /Cancel/ }))
  const cancelButton = screen.getByRole('button', { name: /Cancel/ })
  fireEvent.click(cancelButton)
  expect(waitForElementToBeRemoved(cancelButton))
})
