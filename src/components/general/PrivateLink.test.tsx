import React from 'react'

import { config } from 'src/config'
import { render } from 'src/test-helpers/test-utils'

import PrivateLink from './PrivateLink'

jest.mock('src/config')
const mockedConfig = config as jest.Mocked<typeof config>

describe('PrivateLink', () => {
  it('should render a link with the href if config.showPrivateUrl is true', () => {
    mockedConfig.showPrivateUrl = true
    const href = 'example link'
    const { container } = render(<PrivateLink href={href} />)

    expect(container).toMatchInlineSnapshot(`
      <div>
        <a
          class="MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-colorPrimary"
          href="example link"
        />
      </div>
    `)
  })

  it('should render a link without the href if config.showPrivateUrl is false', () => {
    mockedConfig.showPrivateUrl = false
    const href = 'example link'
    const { container } = render(<PrivateLink href={href} />)

    expect(container).toMatchInlineSnapshot(`
          <div>
            <a
              class="MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-colorPrimary"
            />
          </div>
      `)
  })
})
