import { Link, Typography } from '@material-ui/core'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { Alert } from '@material-ui/lab'
import { Field } from 'formik'
import { TextField } from 'formik-material-ui'
import React from 'react'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    p2EntryField: {
      marginTop: theme.spacing(4),
      width: '100%',
      background: '#fff',
    },
    beginButton: {
      display: 'block',
      width: '10rem',
    },
  }),
)

const Beginning = (): JSX.Element => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Typography variant='h4' gutterBottom>
        Design and Document Your Experiment
      </Typography>
      <Typography variant='body2'>
        We think one of the best ways to prevent a failed experiment is by documenting what you hope to learn.{/* */}
        <br />
        <br />
      </Typography>
      <Alert severity='info'>
        Our{' '}
        <Link
          underline='always'
          href='https://fieldguide.automattic.com/the-experimentation-platform/how-to-run-an-a-b-experiment/'
          target='_blank'
        >
          FieldGuide
        </Link>{' '}
        is a great place to start, it will instruct you on{' '}
        <Link
          underline='always'
          href='https://fieldguide.automattic.com/the-experimentation-platform/document-experiment/'
          target='_blank'
        >
          documenting your experiment
        </Link>{' '}
        and creating a post on{' '}
        <Link underline='always' href='https://a8cexperiments.wordpress.com/' target='_blank'>
          a8cexperiments
        </Link>{' '}
        P2.
      </Alert>
      <Field
        className={classes.p2EntryField}
        component={TextField}
        id='experiment.p2Url'
        name='experiment.p2Url'
        placeholder='https://a8cexperiments.wordpress.com/your-experiment-url'
        label={`Your a8cexperiments P2 post URL`}
        variant='outlined'
        InputLabelProps={{
          shrink: true,
        }}
      />
    </div>
  )
}

export default Beginning
