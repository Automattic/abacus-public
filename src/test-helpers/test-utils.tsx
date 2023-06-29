/* eslint-disable @typescript-eslint/no-unsafe-return,@typescript-eslint/explicit-module-boundary-types */
import { act, fireEvent, getByRole, render as actualRender, RenderOptions, screen } from '@testing-library/react'
import mediaQuery from 'css-mediaquery'
import { Formik, FormikValues } from 'formik'
import React from 'react'
import { StaticRouter } from 'react-router-dom'
import { ValidationError } from 'yup'

import { AnalysisStrategyToHuman } from 'src/lib/explat/analyses'
import { AnalysisStrategy, MetricParameterType } from 'src/lib/explat/schemas'
import ThemeProvider from 'src/styles/ThemeProvider'

/**
 * A wrapped unit-test react-renderer, useful for adding React Contexts globally.
 */
export const render = (ui: React.ReactElement, options?: Omit<RenderOptions, 'queries'>) =>
  actualRender(
    (
      <StaticRouter>
        <ThemeProvider>{ui}</ThemeProvider>
      </StaticRouter>
    ) as React.ReactElement,
    options,
  )

/**
 * Create a `matchMedia` function that will match a query based on the specified
 * width.
 *
 *     const initialJsDomWindowInnerWidth = window.innerWidth
 *     afterEach(() => {
 *       // Reset back to initial width for tests that don't explicitly set the width
 *       // themselves.
 *       window.matchMedia = createMatchMedia(initialJsDomWindowInnerWidth)
 *     })
 *
 *     test('...', () => {
 *       window.matchMedia = createMatchMedia(600)
 *       ...
 *     })
 *
 * @param width - The width of the window to simulate.
 */
export function createMatchMedia(width: number) {
  return (query: string) => ({
    matches: mediaQuery.match(query, { width }),
    media: query,
    addEventListener: jest.fn(),
    addListener: jest.fn(),
    dispatchEvent: jest.fn(),
    onchange: jest.fn(),
    removeEventListener: jest.fn(),
    removeListener: jest.fn(),
  })
}

/**
 * Mock Formik for rendering Formik components when you don't care about the formik connection.
 */
export const MockFormik = ({
  children,
  initialValues = {},
}: {
  children: React.ReactNode
  initialValues?: FormikValues
}) => {
  return (
    <Formik initialValues={initialValues} onSubmit={() => undefined}>
      {children}
    </Formik>
  )
}

/**
 * Validation Error Displayer
 */
export async function validationErrorDisplayer<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise
  } catch (err) {
    if (err instanceof ValidationError) {
      expect(err.errors).toEqual([])
    }
    throw err
  }
}

/**
 * Change the value in a form field.
 */
export async function changeFieldByRole(role: string, name: RegExp, value: string) {
  const field = screen.getByRole(role, { name: name })
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    fireEvent.change(field, { target: { value: value } })
  })
}

/**
 * Change the Analysis Strategy in Experiment Results
 */
export async function changeAnalysisStrategy(newAnalysisStrategy = AnalysisStrategy.IttPure) {
  const analysisStrategyLabel = AnalysisStrategyToHuman[newAnalysisStrategy]
  fireEvent.click(screen.getByRole('button', { name: /Choose an Analysis Strategy/ }))
  const analysisStrategy = screen.getByRole('button', { name: /Analysis Strategy:/ })
  fireEvent.focus(analysisStrategy)
  fireEvent.keyDown(analysisStrategy, { key: 'Enter' })
  const analysisStrategyOption = await screen.findByRole('option', { name: analysisStrategyLabel })
  fireEvent.click(analysisStrategyOption)
}

/**
 * Use the Mininum Difference Calculator
 */
export async function interactWithMinDiffCalculator(
  parameterType: MetricParameterType,
  usersCount = '500000',
  baselineValue = '10000',
  extraValue = '100',
) {
  await changeFieldByRole('spinbutton', /Users \/ month/, usersCount)

  if (parameterType === MetricParameterType.Conversion) {
    await changeFieldByRole('spinbutton', /Baseline conversion/, baselineValue)
    await changeFieldByRole('spinbutton', /Extra conversions \/ month/, extraValue)
    screen.getByRole('checkbox', { name: /I understand that a conversion rate/ }).click()
    screen.getByRole('button', { name: /Apply min diff/ }).click()
  }

  if (parameterType === MetricParameterType.Revenue) {
    await changeFieldByRole('spinbutton', /Baseline cash sales/, baselineValue)
    await changeFieldByRole('spinbutton', /Extra cash sales \/ month/, extraValue)
    screen.getByRole('checkbox', { name: /I understand that ACPU/ }).click()
    screen.getByRole('button', { name: /Apply min diff/ }).click()
  }
}

/**
 * Change the Estimated impact interval in Experiment Results
 */
export async function changeEstimatedImpactInterval(fromMonths: number, toMonths: number) {
  const estimatedImpactSelector = screen.getByRole('button', { name: fromMonths === 1 ? /months/ : /year/ })
  fireEvent.focus(estimatedImpactSelector)
  fireEvent.keyDown(estimatedImpactSelector, { key: 'Enter' })
  const intervalOption = await screen.findByRole('option', { name: toMonths === 1 ? /month/ : /year/ })
  fireEvent.click(intervalOption)
}

/**
 * Open the Metric autocomplete in Metric Assignment Form
 */
export function openMetricAutocomplete() {
  const metricSearchField = screen.getByRole('combobox', { name: /Select a metric/ })
  const metricSearchFieldMoreButton = getByRole(metricSearchField, 'button', { name: 'Open' })
  fireEvent.click(metricSearchFieldMoreButton)
}
