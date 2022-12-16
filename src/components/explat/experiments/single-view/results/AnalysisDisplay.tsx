import { Tooltip } from '@material-ui/core'
import { capitalize } from 'lodash'
import React from 'react'

import { getChosenVariation } from 'src/lib/explat/experiments'
import type { Recommendation } from 'src/lib/explat/recommendations'
import { Decision } from 'src/lib/explat/recommendations'
import type { ExperimentFull } from 'src/lib/explat/schemas'
import { useDecorationStyles } from 'src/styles/styles'

/**
 * Displays the Analysis decision.
 */
export default function AnalysisDisplay({
  analysis,
  experiment,
}: {
  analysis: Recommendation
  experiment: ExperimentFull
}): JSX.Element {
  const decorationClasses = useDecorationStyles()
  switch (analysis.decision) {
    case Decision.ManualAnalysisRequired:
      return (
        <Tooltip title='Contact @experimentation-review on #a8c-experiments'>
          <span className={decorationClasses.tooltipped}>Manual analysis required</span>
        </Tooltip>
      )
    case Decision.MissingAnalysis:
      return <>Not analyzed yet</>
    case Decision.Inconclusive:
      return <>Inconclusive</>
    case Decision.NoDifference:
      return <>No difference</>
    case Decision.VariantBarelyAhead: {
      return <>{capitalize(getChosenVariation(experiment, analysis)?.name)} barely ahead</>
    }
    case Decision.VariantAhead: {
      return <>{capitalize(getChosenVariation(experiment, analysis)?.name)} ahead</>
    }
    case Decision.VariantWinning: {
      return <>{capitalize(getChosenVariation(experiment, analysis)?.name)} winning</>
    }
    default:
      throw new Error('Missing Decision.')
  }
}
