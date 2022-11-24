import { createStyles, makeStyles, Theme } from '@material-ui/core'
import clsx from 'clsx'
import _ from 'lodash'
import React from 'react'

import { Recommendation } from 'src/lib/recommendations'

const DIAGRAM_WIDTH = 150
const DIAGRAM_HEIGHT = 19
// We need an offset in order to avoid SVG elements having the stroke painted at the very edge of the element
const OFFSET = 2

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: DIAGRAM_WIDTH + OFFSET * 4,
      height: DIAGRAM_HEIGHT,
    },
    minDifference: {
      stroke: '#4e4e4e',
      strokeWidth: 2,
      strokeDasharray: '3.5 2',
    },
    intervalGroup: {
      opacity: 0.85,
      fill: theme.palette.background.inactionableYellow,
      stroke: theme.palette.background.inactionableYellow,
    },
    intervalWithEnoughData: {
      fill: theme.palette.background.actionableGreen,
      stroke: theme.palette.background.actionableGreen,
    },
    intervalEdge: {
      strokeWidth: 2,
    },
  }),
)

export default function CredibleIntervalVisualization({
  top,
  bottom,
  minDifference,
  recommendation,
}: {
  top: number
  bottom: number
  minDifference: number
  recommendation: Recommendation
}): JSX.Element {
  const classes = useStyles()
  const metric = {
    top,
    bottom,
    minDifference,
  }

  const valueDomain = Math.max(metric.minDifference, metric.top, -metric.bottom)

  const scale = (value: number) => {
    const accuratePosition = ((value / valueDomain) * DIAGRAM_WIDTH) / 2 + DIAGRAM_WIDTH / 2 + OFFSET * 2
    if (value > 0) {
      return accuratePosition + OFFSET
    } else if (value < 0) {
      return accuratePosition - OFFSET
    } else {
      return accuratePosition
    }
  }

  return (
    <svg className={classes.root}>
      {/* dotted lines representing minimum difference */}
      <line
        className={classes.minDifference}
        x1={scale(-metric.minDifference)}
        x2={scale(-metric.minDifference)}
        y1={2}
        y2={DIAGRAM_HEIGHT - 2}
      />
      <line
        className={classes.minDifference}
        x1={scale(metric.minDifference)}
        x2={scale(metric.minDifference)}
        y1={2}
        y2={DIAGRAM_HEIGHT - 2}
      />
      {/* middle black line */}
      <line x1={scale(0)} x2={scale(0)} y2={DIAGRAM_HEIGHT} stroke='#4e4e4e' strokeWidth={2} />
      <g className={clsx(classes.intervalGroup, recommendation.strongEnoughData && classes.intervalWithEnoughData)}>
        <rect
          x={scale(metric.bottom)}
          width={scale(metric.top) - scale(metric.bottom)}
          height={10}
          y={DIAGRAM_HEIGHT / 2 - 10 / 2}
        />
        <line
          className={classes.intervalEdge}
          x1={scale(metric.bottom)}
          x2={scale(metric.bottom)}
          y1={2}
          y2={DIAGRAM_HEIGHT - 2}
        />
        <line
          className={classes.intervalEdge}
          x1={scale(metric.top)}
          x2={scale(metric.top)}
          y1={2}
          y2={DIAGRAM_HEIGHT - 2}
        />
      </g>
    </svg>
  )
}
