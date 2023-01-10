import { Button } from '@material-ui/core'
import { Assignment, AssignmentTurnedIn } from '@material-ui/icons'
import { useSnackbar } from 'notistack'
import React, { useState } from 'react'

export default function ClipboardButton({
  text = '',
  targetName = 'Text',
}: {
  text?: string
  targetName?: string
}): JSX.Element {
  const [wasTextCopied, setWasTextCopied] = useState(false)
  const { enqueueSnackbar } = useSnackbar()

  const setClipboard = () => {
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setWasTextCopied(true)
        enqueueSnackbar(`${targetName} copied!`, { variant: 'success' })
        return
      })
      .catch((e: string) => {
        console.error('Copying failed: ', e)
        enqueueSnackbar(`Copying failed. ${e}`, { variant: 'error' })
      })
  }

  return (
    <Button onClick={setClipboard}>
      {wasTextCopied ? <AssignmentTurnedIn /> : <Assignment />}
      Copy
    </Button>
  )
}
