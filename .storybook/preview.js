import React from 'react'

import ThemeProvider from 'src/styles/ThemeProvider'

export const decorators = [(storyFn) => <ThemeProvider>{storyFn()}</ThemeProvider>]
