import { InputAdornment, TextField as MuiTextField, Typography } from '@material-ui/core'
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles'
import { Alert, AutocompleteRenderInputParams } from '@material-ui/lab'
import { Field } from 'formik'
import { TextField } from 'formik-material-ui'
import React from 'react'

import AbacusAutocomplete, { autocompleteInputProps } from 'src/components/general/Autocomplete'
import PrivateLink from 'src/components/general/PrivateLink'

import { ExperimentFormCompletionBag } from './ExperimentForm'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
    row: {
      margin: theme.spacing(5, 0, 1, 0),
      display: 'flex',
      alignItems: 'center',
      '&:first-of-type': {
        marginTop: theme.spacing(3),
      },
      [theme.breakpoints.down('xs')]: {
        flexDirection: 'column',
        alignItems: 'stretch',
      },
    },
    through: {
      flex: 0,
      margin: theme.spacing(0, 2),
      color: theme.palette.text.hint,
      [theme.breakpoints.down('xs')]: {
        margin: theme.spacing(2, 2),
      },
    },
    datePicker: {
      flex: 1,
      '& input:invalid': {
        // Fix the native date-picker placeholder text colour
        color: theme.palette.text.hint,
      },
    },
  }),
)

const BasicInfo = ({
  completionBag: { userCompletionDataSource },
}: {
  completionBag: ExperimentFormCompletionBag
}): JSX.Element => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Typography variant='h4' gutterBottom>
        Start designing your experiment
      </Typography>

      <Typography variant='body2'>
        Our{' '}
        <PrivateLink underline='always' href='https://wp.me/PCYsg-Hs4' target='_blank'>
          FieldGuide
        </PrivateLink>{' '}
        is a great place to start, it will instruct you on how to{' '}
        <PrivateLink underline='always' href='https://wp.me/PCYsg-FqB' target='_blank'>
          design your experiment.
        </PrivateLink>
        <br />
        <br />
      </Typography>

      <div className={classes.row}>
        <Field
          component={TextField}
          name='experiment.name'
          id='experiment.name'
          label='Experiment name'
          placeholder='experiment_name'
          helperText='Use snake_case.'
          variant='outlined'
          fullWidth
          required
          InputLabelProps={{
            shrink: true,
          }}
        />
      </div>

      <div className={classes.row}>
        <Field
          component={TextField}
          name='experiment.description'
          id='experiment.description'
          label='Experiment description'
          placeholder='Monthly vs. yearly pricing'
          helperText='State your hypothesis.'
          variant='outlined'
          fullWidth
          required
          multiline
          rows={4}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </div>

      <Alert severity='warning'>
        Experiments are no longer schedulable, and must be started/stopped manually via the buttons on the experiment
        page.
      </Alert>

      <div className={classes.row}>
        <Field
          component={AbacusAutocomplete}
          name='experiment.ownerLogin'
          id='experiment.ownerLogin'
          fullWidth
          options={userCompletionDataSource.data ?? []}
          loading={userCompletionDataSource.isLoading}
          noOptionsText='No users found'
          renderInput={(params: AutocompleteRenderInputParams) => (
            <MuiTextField
              {...params}
              label='Owner'
              placeholder='wp_username'
              helperText='Use WordPress.com username.'
              variant='outlined'
              required
              InputProps={{
                ...autocompleteInputProps(params, userCompletionDataSource.isLoading),
                startAdornment: <InputAdornment position='start'>@</InputAdornment>,
              }}
              InputLabelProps={{
                shrink: true,
              }}
            />
          )}
        />
      </div>

      <div className={classes.row}>
        <Field
          component={TextField}
          id='experiment.p2Url'
          name='experiment.p2Url'
          placeholder='https://a8cexperiments.wordpress.com/your-experiment-url'
          label='Your a8cexperiments P2 post URL'
          helperText='Optional for now, but a URL is required for experiment launch.'
          variant='outlined'
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />
      </div>
      <Alert severity='info'>
        After submitting your experiment, Abacus will provide a pre-filled P2 experiment template in the Setup tab to
        get you started on{' '}
        <PrivateLink underline='always' href='https://wp.me/PCYsg-Gek' target='_blank'>
          experiment documentation
        </PrivateLink>
        .
      </Alert>
    </div>
  )
}

export default BasicInfo
