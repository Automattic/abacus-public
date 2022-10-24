import { MenuItem, Select } from '@material-ui/core'
import _ from 'lodash'
import React from 'react'

const ImpactIntervalSelector = ({
  months,
  onSetMonths,
  className,
}: {
  months: number
  onSetMonths: (months: number) => void
  className?: string
}): JSX.Element => (
  <Select
    id='impact-interval-selector'
    labelId='impact-interval-selector-label'
    value={months}
    onChange={(e) => onSetMonths(e.target.value as number)}
    className={className}
  >
    <MenuItem key={1} value={1}>
      month
    </MenuItem>
    <MenuItem key={12} value={12}>
      year
    </MenuItem>
  </Select>
)

export default ImpactIntervalSelector
