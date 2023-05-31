import { makeStyles, Theme, Typography } from '@material-ui/core'
import React from 'react'

import Layout from 'src/components/page-parts/Layout'

const useStyles = makeStyles((theme: Theme) => ({
  title: {
    marginTop: theme.spacing(2),
  },
}))

export const NotFound = function (): JSX.Element {
  const classes = useStyles()
  return (
    <Layout headTitle='Experiments' flexContent>
      <Typography variant='h3' className={classes.title}>
        404. Path Not Found.
      </Typography>
    </Layout>
  )
}
