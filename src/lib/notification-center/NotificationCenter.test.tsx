import React from 'react'

import {fireEvent, render, waitFor} from '@testing-library/react'

import {genNotifications} from '../utils/test.utils'
import NotificationCenter from './NotificationCenter'

describe('NotificationCenter tests', () => {
  it('should render', async () => {
    const notifications = genNotifications(1)
    const {getByRole, getAllByRole} = render(<NotificationCenter notifications={notifications}/>)
    const button = getByRole(/button/i)
    fireEvent.click(button)

    await waitFor(() => {
      const [, ...items] = getAllByRole(/heading/i)
      expect(items[0].innerHTML).toStrictEqual(notifications[0].title)
    })
  })

  it.skip('should render loading', () => {
    const {getByText} = render(<NotificationCenter loading={true} />)
    expect(getByText('loading')).toBeInTheDocument()
  })
})