import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core'
import * as dateFns from 'date-fns'
import { Field, Formik } from 'formik'
import { TextField } from 'formik-material-ui'
import { useSnackbar } from 'notistack'
import React, { useState } from 'react'
import * as yup from 'yup'

import ExperimentsApi from 'src/api/explat/ExperimentsApi'
import { serverErrorMessage } from 'src/api/HttpResponseError'
import PrivateLink from 'src/components/general/PrivateLink'
import { experimentToFormData } from 'src/lib/explat/form-data'
import { ExperimentFull, ExperimentFullNew, experimentFullNewSchema, Status } from 'src/lib/explat/schemas'
import { useDangerStyles } from 'src/styles/styles'
import { formatIsoDate } from 'src/utils/time'

import LoadingButtonContainer from '../../../general/LoadingButtonContainer'

const useStyles = makeStyles(() =>
  createStyles({
    dangerImage: {
      textAlign: 'center',
    },
  }),
)

const ExperimentRunButton = ({
  experiment,
  experimentReloadRef,
}: {
  experiment: ExperimentFull | null
  experimentReloadRef: React.MutableRefObject<() => void>
}): JSX.Element => {
  const classes = useStyles()
  const dangerClasses = useDangerStyles()
  const { enqueueSnackbar } = useSnackbar()

  // Dialog Management
  const canRunExperiment = experiment && experiment.status === Status.Staging
  const [isAskingToConfirmRunExperiment, setIsAskingToConfirmRunExperiment] = useState<boolean>(false)
  const onAskToConfirmRunExperiment = () => setIsAskingToConfirmRunExperiment(true)
  const onCancelRunExperiment = () => setIsAskingToConfirmRunExperiment(false)

  const launchExperiment = async () => {
    try {
      // istanbul ignore next; Shouldn't occur
      if (!experiment) {
        throw Error('Missing experiment, this should not happen')
      }

      await ExperimentsApi.changeStatus(experiment.experimentId, Status.Running)
      enqueueSnackbar('Experiment Launched!', { variant: 'success' })
      experimentReloadRef.current()
    } catch (e) /* istanbul ignore next; Shouldn't occur */ {
      console.log(e)
      enqueueSnackbar(`Oops! Something went wrong while trying to run your experiment. ${serverErrorMessage(e)}`, {
        variant: 'error',
      })
      throw e
    }
  }

  const editValidationSchema = yup
    .object({
      // We need to ensure the end date is in the future
      endDatetime: (yup.reach(experimentFullNewSchema, 'endDatetime') as unknown as yup.MixedSchema)
        .defined()
        .required()
        .test(
          'future-end-date',
          'End date (UTC must be in the future.',
          // We need to refer to new Date() instead of using dateFns.isFuture so MockDate works with this in the tests.
          (date) => !!date && dateFns.isBefore(new Date(), date as Date),
        ),
      p2Url: (yup.reach(experimentFullNewSchema, 'p2Url') as unknown as yup.MixedSchema).defined().required(),
    })
    .required()
  const editInitialExperiment = {
    endDatetime: experiment && experiment.endDatetime ? formatIsoDate(experiment.endDatetime) : '',
    p2Url: experiment && experiment.p2Url ? experiment.p2Url : '',
  }
  const updateExperiment = async (formData: { experiment: typeof editInitialExperiment }) => {
    // istanbul ignore next; Shouldn't occur
    if (!experiment) {
      throw new Error('Missing experiment')
    }

    const experimentData = {
      ...experimentToFormData(experiment),
      ...formData.experiment,
    } as unknown as ExperimentFullNew

    try {
      await ExperimentsApi.put(experiment.experimentId, experimentData)
      enqueueSnackbar('Experiment updated', { variant: 'success' })
      experimentReloadRef.current()
    } catch (e) /* istanbul ignore next; Shouldn't happen */ {
      console.error(e)
      enqueueSnackbar(`Oops! Something went wrong while trying to update your experiment. ${serverErrorMessage(e)}`, {
        variant: 'error',
      })
      throw e
    }
  }

  const [isSubmittingRunExperiment, setIsSubmittingRunExperiment] = useState<boolean>(false)
  const onSubmit = async (formData: { experiment: typeof editInitialExperiment }) => {
    try {
      setIsSubmittingRunExperiment(true)
      await updateExperiment(formData)
      await launchExperiment()
      setIsAskingToConfirmRunExperiment(false)
    } finally {
      setIsSubmittingRunExperiment(false)
    }
  }

  return (
    <>
      <Tooltip title={canRunExperiment ? '' : `This experiment is ${experiment?.status ?? 'undefined status'}.`}>
        <span>
          <Button
            variant='outlined'
            classes={{ outlined: dangerClasses.dangerButtonOutlined }}
            disabled={!canRunExperiment}
            onClick={onAskToConfirmRunExperiment}
          >
            1. Launch
          </Button>
        </span>
      </Tooltip>
      <Dialog
        open={isAskingToConfirmRunExperiment}
        aria-labelledby='confirm-run-experiment-dialog-title'
        BackdropProps={{ className: dangerClasses.dangerBackdrop }}
      >
        <DialogTitle>
          <Typography variant='h5' component='div'>
            Are you sure you want to <strong>launch</strong> this experiment?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' gutterBottom>
            Launching will <strong>release experiment code to our users.</strong> This may take up to ten minutes to
            propagate to all servers due to{' '}
            <PrivateLink
              href='https://wp.me/PCYsg-Fq9#logged-out-homepage-assignments-use-file-system-cache'
              rel='noopener noreferrer'
              target='_blank'
            >
              the file system assignment cache
            </PrivateLink>
            .
          </Typography>
          <Typography variant='body2' gutterBottom>
            Launching also changes the experiment&apos;s status to running, which is <strong>irreversible</strong>.
          </Typography>
          <div className={classes.dangerImage}>
            <img src='/img/danger.gif' alt='DANGER!' />
          </div>
        </DialogContent>
        <Formik
          initialValues={{ experiment: editInitialExperiment }}
          validationSchema={yup.object({ experiment: editValidationSchema }).required()}
          validateOnMount
          onSubmit={onSubmit}
        >
          {(formikProps) => (
            <form onSubmit={formikProps.handleSubmit} noValidate>
              <DialogContent>
                <Typography variant='body2' gutterBottom>
                  An eventual end date is <strong>required</strong> to prevent experiments running forever:
                </Typography>
                <br />
                <Field
                  component={TextField}
                  name='experiment.endDatetime'
                  id='experiment.endDatetime'
                  label='End date'
                  helperText={'Use the UTC timezone.'}
                  type='date'
                  variant='outlined'
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <br />
                <br />
                <Typography variant='body2' gutterBottom>
                  A P2 post URL is <strong>required</strong> for launching the experiment:
                </Typography>
                <br />
                <Field
                  component={TextField}
                  name='experiment.p2Url'
                  id='experiment.p2Url'
                  label='Your a8cexperiments P2 post URL'
                  placeholder='https://a8cexperiments.wordpress.com/your-experiment-url'
                  helperText='The Systems team will thank you for making debugging easier.'
                  type='url'
                  variant='outlined'
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button variant='contained' onClick={onCancelRunExperiment} color='primary'>
                  Cancel
                </Button>
                <LoadingButtonContainer isLoading={formikProps.isSubmitting}>
                  <Button
                    variant='contained'
                    type='submit'
                    classes={{ contained: dangerClasses.dangerButtonContained }}
                    disabled={isSubmittingRunExperiment || formikProps.isSubmitting || !formikProps.isValid}
                  >
                    Launch
                  </Button>
                </LoadingButtonContainer>
              </DialogActions>
            </form>
          )}
        </Formik>
      </Dialog>
    </>
  )
}

export default ExperimentRunButton
