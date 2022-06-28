import { createStyles, makeStyles, Theme } from '@material-ui/core'
import _ from 'lodash'
import React from 'react'

const DIAGRAM_WIDTH = 150
const DIAGRAM_HEIGHT = 45
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
      strokeDasharray: '4 3',
    },
    intervalGroup: {
      opacity: 0.8,
    },
    intervalEdge: {
      stroke: theme.palette.grey[400],
      strokeWidth: 2,
    },
    intervalMiddle: {
      fill: theme.palette.grey[400],
    },
  }),
)

export default function CredibleIntervalVisualization({
  top,
  bottom,
  minDifference,
}: {
  top: number
  bottom: number
  minDifference: number
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
        y1={10}
        y2={DIAGRAM_HEIGHT - 10}
      />
      <line
        className={classes.minDifference}
        x1={scale(metric.minDifference)}
        x2={scale(metric.minDifference)}
        y1={10}
        y2={DIAGRAM_HEIGHT - 10}
      />
      {/* middle black line */}
      <line x1={scale(0)} x2={scale(0)} y2={DIAGRAM_HEIGHT} stroke='#4e4e4e' strokeWidth={2} />
      <g className={classes.intervalGroup}>
        <rect
          className={classes.intervalMiddle}
          x={scale(metric.bottom)}
          width={scale(metric.top) - scale(metric.bottom)}
          height={15}
          y={DIAGRAM_HEIGHT / 2 - 15 / 2}
        />
        <line
          className={classes.intervalEdge}
          x1={scale(metric.bottom)}
          x2={scale(metric.bottom)}
          y1={12}
          y2={DIAGRAM_HEIGHT - 12}
        />
        <line
          className={classes.intervalEdge}
          x1={scale(metric.top)}
          x2={scale(metric.top)}
          y1={12}
          y2={DIAGRAM_HEIGHT - 12}
        />
      </g>
    </svg>
  )
}
