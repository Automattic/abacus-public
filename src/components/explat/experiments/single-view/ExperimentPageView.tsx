// istanbul ignore file; Even though it sits with components this is a "page" component
import { Button, createStyles, LinearProgress, makeStyles, Tab, Tabs, Theme, Tooltip } from '@material-ui/core'
import React, { useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'

import AnalysesApi from 'src/api/explat/AnalysesApi'
import ExperimentsApi from 'src/api/explat/ExperimentsApi'
import MetricsApi from 'src/api/explat/MetricsApi'
import SegmentsApi from 'src/api/explat/SegmentsApi'
import TagsApi from 'src/api/explat/TagsApi'
import ExperimentDisableButton from 'src/components/explat/experiments/single-view/ExperimentDisableButton'
import ExperimentSetup from 'src/components/explat/experiments/single-view/ExperimentSetup'
import ExperimentDetails from 'src/components/explat/experiments/single-view/overview/ExperimentDetails'
import PageTitleWithSlug from 'src/components/general/PageTitleWithSlug'
import Layout from 'src/components/page-parts/Layout'
import * as Schemas from 'src/lib/explat/schemas'
import { useDataLoadingError, useDataSource } from 'src/utils/data-loading'
import { createIdSlug, createUnresolvingPromise, or } from 'src/utils/general'

import ExperimentCompleteButton from './ExperimentCompleteButton'
import ExperimentRunButton from './ExperimentRunButton'
import ExperimentResults from './results/ExperimentResults'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    topBar: {
      display: 'flex',
      marginBottom: theme.spacing(2),
    },
    topBarTabs: {
      flex: 1,
    },
    topBarTab: {
      minWidth: 110,
    },
    topBarActions: {
      display: 'flex',
      alignItems: 'flex-end',
      '& > *': {
        marginLeft: 4,
        marginBottom: 7,
      },
    },
    disableButton: {
      marginRight: theme.spacing(1),
    },
  }),
)

export enum ExperimentView {
  Overview = 'overview',
  Results = 'results',
  Debug = 'debug',
  Setup = 'setup',
}

export default function ExperimentPageView({
  view,
  experimentId,
  debugMode,
}: {
  view?: ExperimentView
  experimentId: number
  debugMode: boolean
}): JSX.Element {
  const classes = useStyles()

  const {
    isLoading: experimentIsLoading,
    data: experiment,
    error: experimentError,
    reloadRef: experimentReloadRef,
  } = useDataSource(
    () => (experimentId ? ExperimentsApi.findById(experimentId) : createUnresolvingPromise<Schemas.ExperimentFull>()),
    [experimentId],
  )
  useDataLoadingError(experimentError, 'Experiment')

  const {
    isLoading: metricsIsLoading,
    data: metrics,
    error: metricsError,
  } = useDataSource(() => MetricsApi.findAll({ includeDebug: true }), [])
  useDataLoadingError(metricsError, 'Metrics')

  const {
    isLoading: segmentsIsLoading,
    data: segments,
    error: segmentsError,
  } = useDataSource(() => SegmentsApi.findAll(), [])
  useDataLoadingError(segmentsError, 'Segments')

  const { isLoading: tagsIsLoading, data: tags, error: tagsError } = useDataSource(() => TagsApi.findAll(), [])
  useDataLoadingError(tagsError, 'Tags')

  const {
    isLoading: analysesIsLoading,
    data: analyses,
    error: analysesError,
  } = useDataSource(async () => {
    if (!experimentId) {
      return createUnresolvingPromise<Schemas.Analysis[]>()
    }
    return AnalysesApi.findByExperimentId(experimentId)
  }, [experimentId])
  useDataLoadingError(analysesError, 'Analyses')

  const isLoading = or(experimentIsLoading, metricsIsLoading, segmentsIsLoading, tagsIsLoading, analysesIsLoading)

  const canEditInWizard = experiment && experiment.status === Schemas.Status.Staging

  const experimentIdSlug = createIdSlug(experimentId, experiment?.name || '')

  const history = useHistory()

  // When landing from experiment directory or by using a '/experiments/{experimentId}' link, the initial view is:
  // - 'Overview' for staging experiments
  // - 'Results' for all other statuses
  useEffect(() => {
    if (!view && experiment) {
      history.replace(
        `/experiments/${experimentIdSlug}/${canEditInWizard ? ExperimentView.Overview : ExperimentView.Results}`,
      )
    }
  }, [history, canEditInWizard, experimentIdSlug, experiment, view])

  return (
    <Layout headTitle={`${experiment?.name ?? 'unknown'} - Experiment`}>
      <>
        <PageTitleWithSlug label='Experiment' slug={experiment?.name ?? ''} isSlugLoading={!experiment} />
        <div className={classes.topBar}>
          <Tabs className={classes.topBarTabs} value={view || false}>
            <Tab
              className={classes.topBarTab}
              label='Overview'
              value={ExperimentView.Overview}
              component={Link}
              to={`/experiments/${experimentIdSlug}/${ExperimentView.Overview}`}
            />
            <Tab
              className={classes.topBarTab}
              label='Results'
              value={ExperimentView.Results}
              component={Link}
              to={`/experiments/${experimentIdSlug}/${ExperimentView.Results}`}
            />
            {debugMode && (
              <Tab
                className={classes.topBarTab}
                label='Debug'
                value={ExperimentView.Debug}
                component={Link}
                to={`/experiments/${experimentIdSlug}/${ExperimentView.Results}`}
              />
            )}
            <Tab
              className={classes.topBarTab}
              label='Setup'
              value={ExperimentView.Setup}
              component={Link}
              to={`/experiments/${experimentIdSlug}/${ExperimentView.Setup}`}
            />
          </Tabs>
          <div className={classes.topBarActions}>
            <ExperimentRunButton {...{ experiment, experimentReloadRef }} />
            <ExperimentCompleteButton {...{ experiment, experimentReloadRef }} />{' '}
            <ExperimentDisableButton {...{ experiment, experimentReloadRef }} className={classes.disableButton} />
            <Tooltip title={canEditInWizard ? '' : 'Only available for staging experiments.'}>
              <span>
                <Button
                  variant='outlined'
                  color='primary'
                  component={Link}
                  to={`/experiments/${experimentIdSlug}/wizard-edit`}
                  disabled={!canEditInWizard}
                >
                  Edit In Wizard
                </Button>
              </span>
            </Tooltip>{' '}
            <Button variant='outlined' color='primary' component={Link} to={`/experiments/${experimentIdSlug}/clone`}>
              Clone
            </Button>
          </div>
        </div>
        {isLoading && <LinearProgress />}
        {experiment && metrics && segments && analyses && tags && (
          <>
            {view === ExperimentView.Overview && (
              <ExperimentDetails {...{ experiment, metrics, segments, tags, experimentReloadRef }} />
            )}
            {view === ExperimentView.Results && <ExperimentResults {...{ experiment, metrics, analyses, debugMode }} />}
            {view === ExperimentView.Setup && <ExperimentSetup {...{ experiment, metrics }} />}
          </>
        )}
      </>
    </Layout>
  )
}
