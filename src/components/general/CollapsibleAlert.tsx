import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons'
import { Alert, Color } from '@material-ui/lab'
import clsx from 'clsx'
import React from 'react'

const useStyles = makeStyles({
  accordionRoot: {
    boxShadow: 'none',
  },
  accordionSummary: {
    paddingLeft: 0,
    minHeight: 20,
    maxHeight: 20,
    '&.Mui-expanded': {
      minHeight: 20,
      maxHeight: 20,
    },
  },
})

export default function CollapsibleAlert({
  id,
  severity,
  summary,
  className,
  children,
}: {
  id: string
  severity: Color
  summary?: React.ReactNode
  className?: string
  children?: React.ReactNode
}): JSX.Element {
  const classes = useStyles()
  const severityClassMap = new Map([
    ['success', 'MuiAlert-standardSuccess'],
    ['info', 'MuiAlert-standardInfo'],
    ['warning', 'MuiAlert-standardWarning'],
    ['error', 'MuiAlert-standardError'],
  ])

  return (
    <Alert severity={severity} className={className}>
      <Accordion className={clsx(severityClassMap.get(severity), classes.accordionRoot)}>
        <AccordionSummary
          classes={{ root: classes.accordionSummary }}
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`${id}-content`}
          id={id}
        >
          {summary}
        </AccordionSummary>
        <AccordionDetails>
          <div>{children}</div>
        </AccordionDetails>
      </Accordion>
    </Alert>
  )
}
