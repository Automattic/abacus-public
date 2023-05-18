import { render } from '@testing-library/react'
import MockDate from 'mockdate'
import React from 'react'

import { MockFormik } from 'src/test-helpers/test-utils'

import BasicInfo from './BasicInfo'
import { ExperimentFormCompletionBag } from './ExperimentForm'

MockDate.set('2020-07-21')

const completionBag: ExperimentFormCompletionBag = {
  userCompletionDataSource: {
    data: null,
    error: null,
    isLoading: false,
    reloadRef: { current: () => undefined },
  },
  eventCompletionDataSource: {
    data: null,
    error: null,
    isLoading: false,
    reloadRef: { current: () => undefined },
  },
  exclusionGroupCompletionDataSource: {
    data: null,
    error: null,
    isLoading: false,
    reloadRef: { current: () => undefined },
  },
}

test('renders as expected', () => {
  const { container } = render(
    <MockFormik>
      <BasicInfo completionBag={completionBag} />
    </MockFormik>,
  )
  expect(container).toMatchSnapshot()
})
