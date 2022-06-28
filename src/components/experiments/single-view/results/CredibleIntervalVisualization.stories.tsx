import { ComponentMeta, Story } from '@storybook/react'
import React, { ComponentProps } from 'react'

import CredibleIntervalVisualization from 'src/components/experiments/single-view/results/CredibleIntervalVisualization'
import theme from 'src/styles/theme'

export default {
  title: 'Credible Interval Visualization',
  component: CredibleIntervalVisualization,
} as ComponentMeta<typeof CredibleIntervalVisualization>

const Template: Story<ComponentProps<typeof CredibleIntervalVisualization> & { isGreyBackGround: boolean }> = ({
  isGreyBackGround,
  ...args
}) => (
  <div style={{ padding: 16, display: 'flex', background: isGreyBackGround ? theme.palette.grey[100] : '#fff' }}>
    <CredibleIntervalVisualization {...args} />
  </div>
)

export const Default = Template.bind({})
Default.args = {
  top: 0.25,
  bottom: -0.1,
  minDifference: 0.2,
  isGreyBackGround: false,
}

export const HugeMinDifference = Template.bind({})
HugeMinDifference.args = { top: 0.01, bottom: -0.25, minDifference: 5 }

export const TinyMinDifference = Template.bind({})
TinyMinDifference.args = { top: 0.8, bottom: -0.2, minDifference: 0.01 }
