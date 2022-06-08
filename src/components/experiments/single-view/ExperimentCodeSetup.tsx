import { createStyles, Link, makeStyles, Paper, Theme, Typography } from '@material-ui/core'
import React from 'react'

import Code from 'src/components/general/Code'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(3),
    },
  }),
)

export default function ExperimentCodeSetup(): JSX.Element {
  const classes = useStyles()
  return (
    <Paper className={classes.root}>
      <Typography variant='h4'>Experiment Code Setup</Typography>
      <br />
      <Typography variant='body1'>
        See{' '}
        <Link
          href='https://fieldguide.automattic.com/the-experimentation-platform/implement-code/'
          rel='noopener noreferrer'
          target='_blank'
          underline='always'
        >
          the wiki
        </Link>{' '}
        for platform-specific instructions.
      </Typography>
      <br />
      <Typography variant='body1'>
        When testing manually, note that <strong>changes may take up to ten minutes to propagate</strong> due to{' '}
        <Link
          href='https://fieldguide.automattic.com/the-experimentation-platform/experiment-assignment-groups/#logged-out-homepage-assignments-use-file-system-cache'
          rel='noopener noreferrer'
          target='_blank'
          underline='always'
        >
          the file system assignment cache
        </Link>
        . As specified in the FieldGuide, you will need to run <Code>svn up</Code> to update your sandbox copy of the
        cache to reflect the latest changes.
      </Typography>
    </Paper>
  )
}
