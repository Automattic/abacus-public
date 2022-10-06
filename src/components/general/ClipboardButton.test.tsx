import { act, fireEvent, screen } from '@testing-library/react'
import * as notistack from 'notistack'
import React from 'react'

import { render } from 'src/test-helpers/test-utils'

import ClipboardButton from './ClipboardButton'

jest.mock('notistack')
const mockedNotistack = notistack as jest.Mocked<typeof notistack>

const textToCopy = 'some_text'

describe('Clipboard Button', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockResolvedValue({}) },
      configurable: true,
    })
  })

  it('renders the copy button', async () => {
    render(<ClipboardButton />)
    expect(screen.queryByRole('button', { name: /Copy/ })).toBeInTheDocument()
  })

  it('copies text to clipboard on click', async () => {
    render(<ClipboardButton text={textToCopy} />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Copy/ }))
    })

    //eslint-disable-next-line @typescript-eslint/unbound-method
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(textToCopy)
  })

  it('renders success snackbar on successful copy', async () => {
    const mockedEnqueueSnackbar = jest.fn()
    mockedNotistack.useSnackbar.mockImplementation(() => ({
      enqueueSnackbar: mockedEnqueueSnackbar,
      closeSnackbar: jest.fn(),
    }))

    render(<ClipboardButton text={textToCopy} />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Copy/ }))
    })

    expect(mockedEnqueueSnackbar.mock.calls[0]).toEqual(['Text copied!', { variant: 'success' }])
  })

  it('renders error snackbar on faled copy', async () => {
    const mockedEnqueueSnackbar = jest.fn()
    mockedNotistack.useSnackbar.mockImplementation(() => ({
      enqueueSnackbar: mockedEnqueueSnackbar,
      closeSnackbar: jest.fn(),
    }))

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: jest.fn().mockRejectedValue('Clipboard error') },
      configurable: true,
    })

    render(<ClipboardButton text={textToCopy} />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Copy/ }))
    })

    expect(mockedEnqueueSnackbar.mock.calls[0]).toEqual(['Copying failed. Clipboard error', { variant: 'error' }])
  })
})
