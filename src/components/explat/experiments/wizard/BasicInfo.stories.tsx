import React from 'react'

import { getEventNameCompletions, getUserCompletions } from 'src/api/explat/AutocompleteApi'
import { AutocompleteItem } from 'src/lib/explat/schemas'
import { MockFormik } from 'src/test-helpers/test-utils'
import { useDataSource } from 'src/utils/data-loading'

import BasicInfo from './BasicInfo'

export default { title: 'ExperimentCreation.Form Parts.BasicInfo' }

export const FormPart = (): JSX.Element => {
  const completionBag = {
    userCompletionDataSource: useDataSource(getUserCompletions, []),
    eventCompletionDataSource: useDataSource(getEventNameCompletions, []),
    exclusionGroupCompletionDataSource: useDataSource<AutocompleteItem[], [], Error>(
      () => new Promise((resolve) => resolve([])),
      [],
    ),
  }
  return (
    <MockFormik>
      <BasicInfo completionBag={completionBag} />
    </MockFormik>
  )
}
