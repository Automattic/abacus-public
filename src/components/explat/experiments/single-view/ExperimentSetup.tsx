import { createStyles, makeStyles, Paper, Theme, Typography } from '@material-ui/core'
import React from 'react'

import ClipboardButton from 'src/components/general/ClipboardButton'
import Code from 'src/components/general/Code'
import { metricValueFormatData } from 'src/components/general/MetricValue'
import PrivateLink from 'src/components/general/PrivateLink'
import { PlatformToHuman } from 'src/lib/explat/experiments'
import { AttributionWindowSecondsToHuman } from 'src/lib/explat/metric-assignments'
import { getUnitInfo, UnitDerivationType, UnitType } from 'src/lib/explat/metrics'
import { ExperimentFull, Metric, MetricAssignment } from 'src/lib/explat/schemas'
import { formatBoolean } from 'src/utils/formatters'
import { createIdSlug } from 'src/utils/general'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    p2DesignPaper: {
      padding: theme.spacing(3),
      marginBottom: theme.spacing(2),
    },
    codeSetupPaper: {
      padding: theme.spacing(3),
    },
    clipboardButton: {
      margin: theme.spacing(2, 0),
    },
    setupSteps: {
      margin: 0,
    },
  }),
)

export default function ExperimentSetup({
  experiment,
  metrics,
}: {
  experiment: ExperimentFull
  metrics: Metric[]
}): JSX.Element {
  const classes = useStyles()
  const experimentUrl = `${window.location.origin}/experiments/${createIdSlug(
    experiment.experimentId,
    experiment.name,
  )}`

  function scaleAndRound(num: number, scale: number) {
    const originalNumDecimals = num.toString().split('.')[1]?.length || 0
    const scaledNum = num * scale
    const scaledNumDecimals = scaledNum.toString().split('.')[1]?.length || 0
    const newNumDecimals = Math.max(0, Math.min(scaledNumDecimals, originalNumDecimals - Math.floor(Math.log10(scale))))
    return Number(scaledNum.toFixed(newNumDecimals))
  }

  function getMetricEntryByMetricAssignment(metricAssignment?: MetricAssignment): string {
    const metric = metrics.find((metric) => metric.metricId === metricAssignment?.metricId)
    // istanbul ignore next; shouldn't occur
    if (!metricAssignment || !metric) return ''

    const unitInfo = getUnitInfo(metric, [UnitDerivationType.AbsoluteDifference])
    const unitType = unitInfo.unitType
    const unit = metricValueFormatData[unitType].unit
    let minDifference = metricAssignment.minDifference

    if (unitType === UnitType.RatioPoints) {
      minDifference = scaleAndRound(Number(minDifference), 100)
    }

    return `<a href="${window.location.origin}/metrics/${createIdSlug(
      metric.metricId,
      metric.name,
    )}" target="_blank" rel="noreferrer noopener">${metric.name}</a>, ${
      AttributionWindowSecondsToHuman[metricAssignment?.attributionWindowSeconds]
    }, ${String(minDifference)} ${String(unit)}`
  }

  const primaryMetric = getMetricEntryByMetricAssignment(
    experiment.metricAssignments.find((metricAssignment) => metricAssignment.isPrimary),
  )

  const secondaryMetrics = experiment.metricAssignments
    .filter((metricAssignment) => !metricAssignment.isPrimary)
    .map((metricAssignment) => `${getMetricEntryByMetricAssignment(metricAssignment)}<br>`)
    .join('')

  const platform = PlatformToHuman[experiment.platform]

  // Very simplistic for now. We could group by type and list the segments in each type.
  const targetAudience = experiment.segmentAssignments.length ? 'Custom' : 'All'

  const existingUsers = formatBoolean(experiment.existingUsersAllowed)

  // Important: when inserting an updated P2 template, we need to 'find and replace' all occurences of '\u00' with '\\u00'.
  // More details in https://github.com/Automattic/abacus/pull/878#discussion_r1211223852
  const p2PostContent = `
  <!-- wp:heading {"level":1,"className":"wp-block-heading","anchor":"experiment-experiment-title"} -->
  <h1 class="wp-block-heading" id="experiment-experiment-title">Experiment: ${experiment.name}</h1>
  <!-- /wp:heading -->
  
  <!-- wp:a8c/editor-notes {"notes":"\\u003cmark style=\\u0022background-color:#7bdcb5\\u0022 class=\\u0022has-inline-color has-black-color\\u0022\\u003e\\u003cstrong\\u003eOverwhelmed?\\u003c/strong\\u003e Ping us on #a8c-experiments to arrange a run through :-)\\u003c/mark\\u003e"} /-->
  
  <!-- wp:a8c/editor-notes {"notes":"Thank you for formally \\u003cstrong\\u003edocumenting\\u003c/strong\\u003e your upcoming A/B experiment!  Check out the \\u003ca href=\\u0022https://fieldguide.automattic.com/the-experimentation-platform/experiment-checklist/\\u0022\\u003eexperiment checklist\\u003c/a\\u003e for tips and tricks on how to fill out the details for this post.\\u003cbr\\u003e\\u003cbr\\u003eMore \\u003cstrong\\u003eeditor's notes\\u003c/strong\\u003e (blue text boxes) will appear throughout this draft to indicate which checklist item can help provide prompts to filling out the details of that section. Look out for the #\\u0026lt;number_value\\u0026gt; to indicate which checklist step to reference. Editor notes will not be viewable in the published post."} /-->
  
  <!-- wp:a8c/editor-notes {"notes":"Please \\u003cstrong\\u003eadd links\\u003c/strong\\u003e to your experiment in \\u003ca href=\\u0022http://experiments.a8c.com\\u0022\\u003eAbacus\\u003c/a\\u003e and a PR to the experiment code. If either are not ready by the time this is published, feel free to write \\u0022TBD\\u0022 for now."} /-->
  
  <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0px","right":"0px","bottom":"0px","left":"0px"}}}} -->
  <p style="margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px"><strong>Experiment</strong>: <a href="${experimentUrl}" target="_blank" rel="noreferrer noopener">${experimentUrl}</a></p>
  <!-- /wp:paragraph -->
  
  <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0px","right":"0px","bottom":"0px","left":"0px"}}}} -->
  <p style="margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px"> </p>
  <!-- /wp:paragraph -->
  
  <!-- wp:paragraph {"style":{"spacing":{"margin":{"top":"0px","right":"0px","bottom":"0px","left":"0px"}}}} -->
  <p style="margin-top:0px;margin-right:0px;margin-bottom:0px;margin-left:0px"><strong>Code</strong>: &lt;link_to_code&gt; </p>
  <!-- /wp:paragraph -->
  
  <!-- wp:heading {"className":"wp-block-heading","anchor":"idea-and-background"} -->
  <h2 class="wp-block-heading" id="idea-and-background">Idea and background</h2>
  <!-- /wp:heading -->
  
  <!-- wp:a8c/editor-notes {"notes":"\\u003ca href=\\u0022https://fieldguide.automattic.com/the-experimentation-platform/experiment-checklist/#2-write-down-goals-and-context\\u0022\\u003e#2 in experiment checklist\\u003c/a\\u003e\\u003cbr\\u003eExperiment background, details, why this is being tested, expected impact, etc."} /-->
  
  <!-- wp:paragraph -->
  <p></p>
  <!-- /wp:paragraph -->
  
  <!-- wp:heading {"className":"wp-block-heading","anchor":"hypothesis"} -->
  <h2 class="wp-block-heading" id="hypothesis">Hypothesis</h2>
  <!-- /wp:heading -->
  
  <!-- wp:a8c/editor-notes {"notes":"\\u003ca href=\\u0022https://fieldguide.automattic.com/the-experimentation-platform/experiment-checklist/#3-write-a-hypothesis-and-choose-an-experiment-name-and-owner\\u0022\\u003e#3 in experiment checklist\\u003c/a\\u003e\\u003cbr\\u003eCome up with a unique experiment name used during implementation.\\u003cbr\\u003eIf we make this change, we expect this result.\\u003cbr\\u003e\\u003cbr\\u003eThe owner of the experiment is considered the decision maker. Please discuss with your team on who will decide which variation to deploy after the experiment concludes. It may be a different person from the one implementing the experiment."} /-->
  
  <!-- wp:paragraph -->
  <p><strong>Experiment name:&nbsp;</strong><code>${experiment.name}</code><br><strong>Owner and decision maker:</strong> @${experiment.ownerLogin}<br><strong>Hypothesis:</strong> ${experiment.description}</p>
  <!-- /wp:paragraph -->
  
  <!-- wp:heading {"className":"wp-block-heading","anchor":"experiences"} -->
  <h2 class="wp-block-heading" id="experiences">Experiences</h2>
  <!-- /wp:heading -->
  
  <!-- wp:a8c/editor-notes {"notes":"\\u003ca href=\\u0022https://fieldguide.automattic.com/the-experimentation-platform/experiment-checklist/#4-design-the-ab-experiences\\u0022\\u003e#4 in experiment checklist\\u003c/a\\u003e\\u003cbr\\u003eScreenshots should include as much context as possible (i.e., do not zoom in on the change).\\u003cbr\\u003eUse gifs as necessary for animations/movement."} /-->
  
  <!-- wp:columns -->
  <div class="wp-block-columns"><!-- wp:column -->
  <div class="wp-block-column"><!-- wp:heading {"level":3,"className":"wp-block-heading","anchor":"control"} -->
  <h3 class="wp-block-heading" id="control">Control</h3>
  <!-- /wp:heading -->
  
  <!-- wp:image -->
  <figure class="wp-block-image"><img alt=""/></figure>
  <!-- /wp:image --></div>
  <!-- /wp:column -->
  
  <!-- wp:column -->
  <div class="wp-block-column"><!-- wp:heading {"level":3,"className":"wp-block-heading","anchor":"treatment"} -->
  <h3 class="wp-block-heading" id="treatment">Treatment</h3>
  <!-- /wp:heading -->
  
  <!-- wp:image -->
  <figure class="wp-block-image"><img alt=""/></figure>
  <!-- /wp:image --></div>
  <!-- /wp:column --></div>
  <!-- /wp:columns -->
  
  <!-- wp:a8c/editor-notes {"notes":"Questions to think about for additional notes about the experiences:\\u003cbr\\u003e- When do the experiences start to differ?\\u003cbr\\u003e- What % of users receive each experience (50/50 is default and is recommended)?"} /-->
  
  <!-- wp:paragraph -->
  <p><strong>Additional notes</strong></p>
  <!-- /wp:paragraph -->
  
  <!-- wp:list -->
  <ul><!-- wp:list-item -->
  <li></li>
  <!-- /wp:list-item -->
  
  <!-- wp:list-item -->
  <li></li>
  <!-- /wp:list-item --></ul>
  <!-- /wp:list -->
  
  <!-- wp:heading {"className":"wp-block-heading","anchor":"metrics"} -->
  <h2 class="wp-block-heading" id="metrics">Metrics</h2>
  <!-- /wp:heading -->
  
  <!-- wp:a8c/editor-notes {"notes":"\\u003ca href=\\u0022https://fieldguide.automattic.com/the-experimentation-platform/experiment-checklist/#5-define-primary-metric-and-practical-significance\\u0022\\u003e#5\\u003c/a\\u003e and\\u003ca href=\\u0022https://fieldguide.automattic.com/the-experimentation-platform/experiment-checklist/#6-add-secondary-metrics\\u0022\\u003e #6\\u003c/a\\u003e in experiment checklist\\u003cbr\\u003e\\u003cbr\\u003eSpecify which \\u003ca href=\\u0022https://experiments.a8c.com/metrics\\u0022\\u003emetric\\u003c/a\\u003e you will use in Abacus. If you do not find a metric you need, \\u003ca href=\\u0022https://fieldguide.automattic.com/the-experimentation-platform/model-experiment/#metrics\\u0022\\u003eplease request a new one\\u003c/a\\u003e be created during your experiment review in \\u003ca href=\\u0022https://a8c.slack.com/archives/C7HH3V5AS\\u0022\\u003e#a8c-experiments\\u003c/a\\u003e and provide us with the metric details.\\u003cbr\\u003e\\u003cbr\\u003eHere are some tips on \\u003ca href=\\u0022https://fieldguide.automattic.com/the-experimentation-platform/design-experiment/#8-define-primary-metric\\u0022\\u003ehow to choose a primary metric\\u003c/a\\u003e and \\u003ca href=\\u0022https://fieldguide.automattic.com/the-experimentation-platform/design-experiment/#9-add-secondary-metrics\\u0022\\u003ehow many metrics you should have\\u003c/a\\u003e in an experiment. For each metric, please specify the \\u003ca href=\\u0022https://fieldguide.automattic.com/the-experimentation-platform/design-experiment/#7-get-comfortable-with-minimum-differences\\u0022\\u003eminimum difference value\\u003c/a\\u003e at the end in parentheses.\\u003cbr\\u003e\\u003cbr\\u003ePlease include an English explanation of all the metric settings, making it clear what changes are considered to be practically significant, which metrics are expected to change, and what trade-offs you're anticipating in case different metrics point towards different conclusions."} /-->
  
  <!-- wp:paragraph -->
  <p><strong>Primary metric:</strong></p>
  <!-- /wp:paragraph -->
  
  <!-- wp:paragraph -->
  <p>${primaryMetric}</p>
  <!-- /wp:paragraph -->
  
  <!-- wp:paragraph -->
  <p><strong>More success metrics and <strong>guardrail metrics</strong>:</strong></p>
  <!-- /wp:paragraph -->

  <!-- wp:paragraph -->
  <p>${secondaryMetrics}</p>
  <!-- /wp:paragraph -->
  
  <!-- wp:heading {"className":"wp-block-heading","anchor":"audience"} -->
  <h2 class="wp-block-heading" id="audience">Audience</h2>
  <!-- /wp:heading -->
  
  <!-- wp:a8c/editor-notes {"notes":"\\u003ca href=\\u0022https://github.com/Automattic/experimentation-platform/wiki/Experiment-Checklist#6-define-the-audience-and-dates\\u0022\\u003e#7\\u003c/a\\u003e and \\u003ca href=\\u0022https://github.com/Automattic/experimentation-platform/wiki/Experiment-Checklist#7-estimate-the-experiment-duration\\u0022\\u003e#8\\u003c/a\\u003e in experiment checklist\\u003cbr\\u003eShare the intended audience for this experiment\\u003cbr\\u003e\\u003cbr\\u003e\\u003cstrong\\u003ePlatform\\u003c/strong\\u003e: where will this experiment run (UI, backend)?\\u003cbr\\u003e\\u003cstrong\\u003eTarget audience\\u003c/strong\\u003e: do you want to target specific locales or countries?\\u003cbr\\u003e\\u003cstrong\\u003eExisting users\\u003c/strong\\u003e: do you want to run the experiment on only new users?\\u003cbr\\u003e\\u003cstrong\\u003eStart and end dates\\u003c/strong\\u003e: when do you want to run the experiment?"} /-->
  
  <!-- wp:paragraph -->
  <p><strong>Platform:</strong>&nbsp;${platform}<br><strong>Target audience:</strong>&nbsp;${targetAudience}<br><strong>Existing users:</strong>&nbsp;${existingUsers}<br><strong>Start and end date:</strong></p>
  <!-- /wp:paragraph -->
  
  <!-- wp:heading {"className":"wp-block-heading","anchor":"bookkeeping"} -->
  <h2 class="wp-block-heading" id="bookkeeping">Bookkeeping</h2>
  <!-- /wp:heading -->
  
  <!-- wp:a8c/editor-notes {"notes":"\\u003ca href=\\u0022https://fieldguide.automattic.com/the-experimentation-platform/experiment-checklist/#9-finalize-and-document-experiment\\u0022\\u003e#9 in experiment checklist\\u003c/a\\u003e\\u003cbr\\u003eAdd additional tags, links, and CCs for your bookkeeping and organizational purposes.\\u003cbr\\u003e\\u003cbr\\u003eIt's highly recommended to \\u003cstrong\\u003ecommunicate the changes with HEs in advance\\u003c/strong\\u003e to address concerns and to agree on a protocol for any potential incoming customer confusion. For example, see how the \\u003ca href=\\u0022https://pricingandpackaging.wordpress.com/2023/03/06/plans-2023-v1-5-2-the-1-year-2-year-toggle/#comment-3807\\u0022\\u003e1-year/2-year toggle experiment\\u003c/a\\u003e launched in Apr 2023 caused unintended frustrated users and negatively impacted HE performance.\\u003cbr\\u003e\\u003cbr\\u003eThe level of the heads-up depends on the impact. For minor changes:\\u003cbr\\u003e- Cross-post to +wpcomhappy.wordpress.com and/or put out an announcement in Slack #wpcom-happy-announce\\u003cbr\\u003e\\u003cbr\\u003eFor major changes:\\u003cbr\\u003e- Follow the \\u003ca href=\\u0022https://fieldguide.automattic.com/launches-deprecations-mass-emails-communicating-with-happiness/launch-checklist/#writing-the-heads-up-post\\u0022\\u003eCommunicating Changes with Happiness\\u003c/a\\u003e guide for starting a more comprehensive discussion."} /-->
  
  <!-- wp:paragraph -->
  <p><strong>Experiment</strong> <strong>Process Checklist:</strong></p>
  <!-- /wp:paragraph -->
  
  <!-- wp:paragraph -->
  <p>Ping reviewers for reviews in Slack (<code>@experiment-review-trainees</code> at #a8c-experiments.</p>
  <!-- /wp:paragraph -->
  
  <!-- wp:a8c/editor-notes {"notes":"Every experiment requires an \\u003ca href=\\u0022https://fieldguide.automattic.com/the-experimentation-platform/experiment-reviewers/\\u0022\\u003eexperiment review\\u003c/a\\u003e. Reviewers will typically provide a review within 24h of the request."} /-->
  
  <!-- wp:p2/task {"assigneesList":[]} -->
  <div class="wp-block-p2-task"><div><span class="wp-block-p2-task__emoji-status" title="Pending">⬜ </span><div class="wp-block-p2-task__checkbox-wrapper"><span title="Pending" class="wp-block-p2-task__checkbox is-disabled is-aria-checked-false"></span></div></div><div class="wp-block-p2-task__main"><div class="wp-block-p2-task__left"><div class="wp-block-p2-task__content-wrapper"><span class="wp-block-p2-task__content">Experiment reviewed.</span></div><div class="wp-block-p2-task__dates"></div></div><div class="wp-block-p2-task__right"><div class="wp-block-p2-task__assignees-avatars"></div></div></div></div>
  <!-- /wp:p2/task -->
  
  <!-- wp:p2/task {"assigneesList":[]} -->
  <div class="wp-block-p2-task"><div><span class="wp-block-p2-task__emoji-status" title="Pending">⬜ </span><div class="wp-block-p2-task__checkbox-wrapper"><span title="Pending" class="wp-block-p2-task__checkbox is-disabled is-aria-checked-false"></span></div></div><div class="wp-block-p2-task__main"><div class="wp-block-p2-task__left"><div class="wp-block-p2-task__content-wrapper"><span class="wp-block-p2-task__content">Abacus reviewed.</span></div><div class="wp-block-p2-task__dates"></div></div><div class="wp-block-p2-task__right"><div class="wp-block-p2-task__assignees-avatars"></div></div></div></div>
  <!-- /wp:p2/task -->
  
  <!-- wp:p2/task {"assigneesList":[]} -->
  <div class="wp-block-p2-task"><div><span class="wp-block-p2-task__emoji-status" title="Pending">⬜ </span><div class="wp-block-p2-task__checkbox-wrapper"><span title="Pending" class="wp-block-p2-task__checkbox is-disabled is-aria-checked-false"></span></div></div><div class="wp-block-p2-task__main"><div class="wp-block-p2-task__left"><div class="wp-block-p2-task__content-wrapper"><span class="wp-block-p2-task__content">Experiment code reviewed (by an experiment reviewer).</span></div><div class="wp-block-p2-task__dates"></div></div><div class="wp-block-p2-task__right"><div class="wp-block-p2-task__assignees-avatars"></div></div></div></div>
  <!-- /wp:p2/task -->
  
  <!-- wp:p2/task {"assigneesList":[]} -->
  <div class="wp-block-p2-task"><div><span class="wp-block-p2-task__emoji-status" title="Pending">⬜ </span><div class="wp-block-p2-task__checkbox-wrapper"><span title="Pending" class="wp-block-p2-task__checkbox is-disabled is-aria-checked-false"></span></div></div><div class="wp-block-p2-task__main"><div class="wp-block-p2-task__left"><div class="wp-block-p2-task__content-wrapper"><span class="wp-block-p2-task__content">Experiment added to relevant product calendar.</span></div><div class="wp-block-p2-task__dates"></div></div><div class="wp-block-p2-task__right"><div class="wp-block-p2-task__assignees-avatars"></div></div></div></div>
  <!-- /wp:p2/task -->
  
  <!-- wp:p2/task {"assigneesList":[]} -->
  <div class="wp-block-p2-task"><div><span class="wp-block-p2-task__emoji-status" title="Pending">⬜ </span><div class="wp-block-p2-task__checkbox-wrapper"><span title="Pending" class="wp-block-p2-task__checkbox is-disabled is-aria-checked-false"></span></div></div><div class="wp-block-p2-task__main"><div class="wp-block-p2-task__left"><div class="wp-block-p2-task__content-wrapper"><span class="wp-block-p2-task__content">Communicated relevant changes to Happiness.</span></div><div class="wp-block-p2-task__dates"></div></div><div class="wp-block-p2-task__right"><div class="wp-block-p2-task__assignees-avatars"></div></div></div></div>
  <!-- /wp:p2/task -->
  
  <!-- wp:p2/task {"assigneesList":[]} -->
  <div class="wp-block-p2-task"><div><span class="wp-block-p2-task__emoji-status" title="Pending">⬜ </span><div class="wp-block-p2-task__checkbox-wrapper"><span title="Pending" class="wp-block-p2-task__checkbox is-disabled is-aria-checked-false"></span></div></div><div class="wp-block-p2-task__main"><div class="wp-block-p2-task__left"><div class="wp-block-p2-task__content-wrapper"><span class="wp-block-p2-task__content">Experiment started.</span></div><div class="wp-block-p2-task__dates"></div></div><div class="wp-block-p2-task__right"><div class="wp-block-p2-task__assignees-avatars"></div></div></div></div>
  <!-- /wp:p2/task -->
  
  <!-- wp:p2/task {"assigneesList":[]} -->
  <div class="wp-block-p2-task"><div><span class="wp-block-p2-task__emoji-status" title="Pending">⬜ </span><div class="wp-block-p2-task__checkbox-wrapper"><span title="Pending" class="wp-block-p2-task__checkbox is-disabled is-aria-checked-false"></span></div></div><div class="wp-block-p2-task__main"><div class="wp-block-p2-task__left"><div class="wp-block-p2-task__content-wrapper"><span class="wp-block-p2-task__content">Experiment finished.</span></div><div class="wp-block-p2-task__dates"></div></div><div class="wp-block-p2-task__right"><div class="wp-block-p2-task__assignees-avatars"></div></div></div></div>
  <!-- /wp:p2/task -->
  
  <!-- wp:p2/task {"assigneesList":[]} -->
  <div class="wp-block-p2-task"><div><span class="wp-block-p2-task__emoji-status" title="Pending">⬜ </span><div class="wp-block-p2-task__checkbox-wrapper"><span title="Pending" class="wp-block-p2-task__checkbox is-disabled is-aria-checked-false"></span></div></div><div class="wp-block-p2-task__main"><div class="wp-block-p2-task__left"><div class="wp-block-p2-task__content-wrapper"><span class="wp-block-p2-task__content">Conclusion reached.</span></div><div class="wp-block-p2-task__dates"></div></div><div class="wp-block-p2-task__right"><div class="wp-block-p2-task__assignees-avatars"></div></div></div></div>
  <!-- /wp:p2/task -->
  
  <!-- wp:paragraph -->
  <p><strong>Tags:</strong></p>
  <!-- /wp:paragraph -->
  
  <!-- wp:paragraph -->
  <p>Required tags: &lt;division-name&gt;, &lt;platform&gt;<br>Recommended tags: &lt;page slug&gt;, &lt;property&gt;, &lt;page section&gt;, &lt;type of asset&gt;, etc.</p>
  <!-- /wp:paragraph -->
  
  <!-- wp:paragraph -->
  <p><strong>Links</strong></p>
  <!-- /wp:paragraph -->
  
  <!-- wp:list -->
  <ul><!-- wp:list-item -->
  <li>&lt;more context links&gt;</li>
  <!-- /wp:list-item --></ul>
  <!-- /wp:list -->
  
  <!-- wp:paragraph -->
  <p><strong>Crosspost and CC:</strong><br>Recommended: &lt;your team P2&gt;, &lt;stakeholders&gt;, &lt;wpcomhappy.wordpress.com, if applicable&gt;, etc.</p>
  <!-- /wp:paragraph -->`

  return (
    <>
      <Paper className={classes.p2DesignPaper}>
        <Typography color='textPrimary' variant='h3' gutterBottom>
          P2 Design Post
        </Typography>
        <Typography variant='body1' gutterBottom>
          We think one of the best ways to prevent a failed experiment is by documenting what you hope to learn. This
          will also help future experiments as your documented design and results may get featured in an upcoming
          Experiments Learnings Library.
        </Typography>
        <Typography variant='body1'>
          Here is the P2 experiment design post starter which{' '}
          <strong>includes all the details of your experiment.</strong>
        </Typography>
        <ClipboardButton
          text={p2PostContent}
          targetName='P2 experiment design'
          label='Copy experiment design'
          variant='outlined'
          className={classes.clipboardButton}
        />
        <ol className={classes.setupSteps}>
          <Typography variant='body1' component='li'>
            Click the button above to copy the P2 post content in your clipboard.
          </Typography>
          <Typography variant='body1' component='li'>
            {' '}
            <PrivateLink
              href='https://a8cexperiments.wordpress.com/?start=new-black-post'
              rel='noopener noreferrer'
              target='_blank'
              underline='always'
            >
              Start a new a8cexperiments P2 post
            </PrivateLink>
            , paste the content and you are ready to go!
          </Typography>
        </ol>
      </Paper>
      <Paper className={classes.codeSetupPaper}>
        <Typography color='textPrimary' variant='h3'>
          Code Setup
        </Typography>
        <br />
        <Typography variant='body1'>
          See{' '}
          <PrivateLink href='https://wp.me/PCYsg-Fq7' rel='noopener noreferrer' target='_blank' underline='always'>
            the wiki
          </PrivateLink>{' '}
          for platform-specific instructions.
        </Typography>
        <br />
        <Typography variant='body1'>
          When testing manually, note that <strong>changes may take up to ten minutes to propagate</strong> due to{' '}
          <PrivateLink
            href='https://wp.me/PCYsg-Fq9#logged-out-homepage-assignments-use-file-system-cache'
            rel='noopener noreferrer'
            target='_blank'
            underline='always'
          >
            the file system assignment cache
          </PrivateLink>
          . As specified in the FieldGuide, you will need to run <Code>svn up</Code> to update your sandbox copy of the
          cache to reflect the latest changes.
        </Typography>
      </Paper>
    </>
  )
}
