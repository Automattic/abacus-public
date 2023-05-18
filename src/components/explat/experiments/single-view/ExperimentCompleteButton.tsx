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
import { useSnackbar } from 'notistack'
import React, { useState } from 'react'

import ExperimentsApi from 'src/api/explat/ExperimentsApi'
import { serverErrorMessage } from 'src/api/HttpResponseError'
import PrivateLink from 'src/components/general/PrivateLink'
import { ExperimentFull, Status } from 'src/lib/explat/schemas'
import { useDangerStyles } from 'src/styles/styles'

import LoadingButtonContainer from '../../../general/LoadingButtonContainer'

const useStyles = makeStyles(() =>
  createStyles({
    dangerImage: {
      textAlign: 'center',
    },
  }),
)

const ExperimentCompleteButton = ({
  experiment,
  experimentReloadRef,
}: {
  experiment: ExperimentFull | null
  experimentReloadRef: React.MutableRefObject<() => void>
}): JSX.Element => {
  const classes = useStyles()
  const dangerClasses = useDangerStyles()
  const { enqueueSnackbar } = useSnackbar()

  const canCompleteExperiment = experiment && experiment.status === Status.Running
  const [isAskingToConfirmCompleteExperiment, setIsAskingToConfirmCompleteExperiment] = useState<boolean>(false)
  const onAskToConfirmCompleteExperiment = () => setIsAskingToConfirmCompleteExperiment(true)
  const onCancelCompleteExperiment = () => setIsAskingToConfirmCompleteExperiment(false)
  const [isSubmittingCompleteExperiment, setIsSubmittingCompleteExperiment] = useState<boolean>(false)
  const onConfirmCompleteExperiment = async () => {
    try {
      // istanbul ignore next; Shouldn't occur
      if (!experiment) {
        throw Error('Missing experiment, this should not happen')
      }

      setIsSubmittingCompleteExperiment(true)
      await ExperimentsApi.changeStatus(experiment.experimentId, Status.Completed)
      enqueueSnackbar('Experiment Completed!', { variant: 'success' })
      experimentReloadRef.current()
      setIsAskingToConfirmCompleteExperiment(false)
    } catch (e) /* istanbul ignore next; Shouldn't occur */ {
      console.log(e)
      enqueueSnackbar(`Oops! Something went wrong while trying to complete your experiment. ${serverErrorMessage(e)}`, {
        variant: 'error',
      })
    } finally {
      setIsSubmittingCompleteExperiment(false)
    }
  }

  return (
    <>
      <Tooltip
        title={
          canCompleteExperiment
            ? 'Stop new user assignments. Current assignments remain active.'
            : `This experiment is ${experiment?.status ?? 'undefined status'}.`
        }
      >
        <span>
          <Button
            variant='outlined'
            classes={{ outlined: dangerClasses.dangerButtonOutlined }}
            disabled={!canCompleteExperiment}
            onClick={onAskToConfirmCompleteExperiment}
          >
            2. Complete
          </Button>
        </span>
      </Tooltip>
      <Dialog
        open={isAskingToConfirmCompleteExperiment}
        aria-labelledby='confirm-complete-experiment-dialog-title'
        BackdropProps={{ className: dangerClasses.dangerBackdrop }}
      >
        <DialogTitle>
          <Typography variant='h5' component='div'>
            Are you sure you want to <strong>complete</strong> this experiment?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' gutterBottom>
            Completing will{' '}
            <strong>
              prevent new users from being assigned to the experiment, users that have already been assigned will
              continue with their assigned experience.
            </strong>{' '}
            This may take up to ten minutes to propagate to all servers due to{' '}
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
            Completing also changes the experiment&apos;s status to completed, which is <strong>irreversible</strong>.
          </Typography>
          <div className={classes.dangerImage}>
            <img src='/img/danger.gif' alt='DANGER!' />
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant='contained' color='primary' onClick={onCancelCompleteExperiment}>
            Cancel
          </Button>
          <LoadingButtonContainer isLoading={isSubmittingCompleteExperiment}>
            <Button
              variant='contained'
              classes={{ contained: dangerClasses.dangerButtonContained }}
              disabled={isSubmittingCompleteExperiment}
              onClick={onConfirmCompleteExperiment}
            >
              Complete
            </Button>
          </LoadingButtonContainer>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ExperimentCompleteButton
