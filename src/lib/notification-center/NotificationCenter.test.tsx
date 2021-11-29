import React from 'react'

import {render} from '@testing-library/react'

import NotificationCenter from './NotificationCenter'

describe('NotificationCenter tests', () => {
  it('should render', () => {
    const {getByText} = render(<NotificationCenter />)
    expect(getByText('Notification Center')).toBeInTheDocument()
  })

  it('should render loading', () => {
    const {getByText} = render(<NotificationCenter loading={true} />)
    expect(getByText('loading')).toBeInTheDocument()
  })
})