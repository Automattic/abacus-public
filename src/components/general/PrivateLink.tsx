import { Link, LinkProps } from '@material-ui/core'
import React from 'react'

import { config } from 'src/config'

/**
 * Wrap the Material UI <Link /> component filtering the value for 'href' prop based on environment
 */
export default function PrivateLink({ href, ...props }: LinkProps): JSX.Element {
  return <Link href={config.showPrivateUrl ? href : undefined} {...props} />
}
