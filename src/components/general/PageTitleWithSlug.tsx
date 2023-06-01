import { createStyles, makeStyles, Theme, Tooltip, Typography } from '@material-ui/core'
import { Skeleton } from '@material-ui/lab'
import React from 'react'

import ClipboardButton from 'src/components/general/ClipboardButton'

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    title: {
      margin: theme.spacing(3, 0, 1, 0),
      color: theme.palette.grey.A700,
    },
    titleHeader: {
      display: 'flex',
      maxWidth: '100%',
      alignItems: 'baseline',
    },
    titleName: {
      fontFamily: theme.custom.fonts.monospace,
      color: '#000',
      display: 'inline',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      marginLeft: theme.spacing(1),
    },
    titleNameSkeleton: {
      display: 'inline-block',
    },
    copyButton: {
      marginLeft: theme.spacing(2),
      padding: theme.spacing(1, 2),
    },
  }),
)

/**
 * Render a page title with a slug that can be asynchronously loaded.
 */
export default function PageTitleWithSlug({
  label,
  slug,
  isSlugLoading,
}: {
  label: string
  slug: string
  isSlugLoading: boolean
}): JSX.Element {
  const classes = useStyles()
  return (
    <div className={classes.title}>
      <Typography className={classes.titleHeader} variant='h2'>
        {label}:{' '}
        {isSlugLoading ? (
          <Skeleton className={classes.titleNameSkeleton} variant='text' width={200} role='placeholder' />
        ) : (
          <>
            <Tooltip title={slug}>
              <span className={classes.titleName}>{slug}</span>
            </Tooltip>
            <ClipboardButton text={slug} targetName={`${label} name`} className={classes.copyButton} />
          </>
        )}
      </Typography>
    </div>
  )
}
