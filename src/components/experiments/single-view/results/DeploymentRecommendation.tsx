import { Tooltip } from '@material-ui/core'
import React from 'react'

import { getChosenVariation } from 'src/lib/experiments'
import type { Recommendation } from 'src/lib/recommendations'
import { Decision } from 'src/lib/recommendations'
import type { ExperimentFull } from 'src/lib/schemas'
import { useDecorationStyles } from 'src/styles/styles'

/**
 * Displays the Deployment recommendation.
 */
export default function DeploymentRecommendation({
  analysis,
  experiment,
}: {
  analysis: Recommendation
  experiment: ExperimentFull
}): JSX.Element {
  const decorationClasses = useDecorationStyles()

  if (analysis.decision === Decision.ManualAnalysisRequired) {
    return (
      <Tooltip title='Contact @experimentation-review on #a8c-experiments'>
        <span className={decorationClasses.tooltipped}>Manual analysis required</span>
      </Tooltip>
    )
  }

  if (analysis.decision === Decision.MissingAnalysis) {
    return <>Not analyzed yet</>
  }

  if (analysis.strongEnoughForDeployment) {
    switch (analysis.decision) {
      case Decision.NoDifference: {
        return <>Deploy either variation</>
      }
      case Decision.VariantAhead:
      case Decision.VariantBarelyAhead: {
        return <>Deploy {getChosenVariation(experiment, analysis)?.name} cautiously</>
      }
      case Decision.VariantWins: {
        return <>Deploy {getChosenVariation(experiment, analysis)?.name} with confidence</>
      }
    }
  }

  return <>Not enough certainty</>
}
