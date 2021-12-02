import React from 'react'

import {fireEvent, render, waitFor} from '@testing-library/react'

import {genNotifications} from '../utils/test.utils'
import NotificationCenter from './NotificationCenter'

describe('NotificationCenter tests', () => {
  it('should render with notifications', async () => {
    const notifications = genNotifications(3)
    // @ts-ignore
    const {getByRole, getAllByRole, getByText} = render(<NotificationCenter notifications={notifications}/>)
    const button = getByRole(/button/i)
    fireEvent.click(button)

    await waitFor(() => {
      const headers = getAllByRole(/heading/i)
      expect(headers).toHaveLength(1)
      expect(headers[0].innerHTML).toStrictEqual('title')
      expect(getByText('reload')).toBeInTheDocument()
      expect(getByText('loadingButton')).toBeInTheDocument()
      expect(getByText('readAll')).toBeInTheDocument()
    })
  })

  it('should render loadingButton when done is false', async () => {
    // @ts-ignore
    const {getByText, getByRole} = render(<NotificationCenter done={false} notifications={[]}/>)
    const button = getByRole(/button/i)
    fireEvent.click(button)

    await waitFor(() => {
      expect(getByText('loadingButton')).toBeInTheDocument()
    })
  })

  it('should render errorMessage when error flag is true', async () => {
    // @ts-ignore
    const {getByText, getByRole} = render(<NotificationCenter error={true} notifications={[]}/>)
    const button = getByRole(/button/i)
    fireEvent.click(button)

    await waitFor(() => {
      expect(getByText('errorMessage')).toBeInTheDocument()
    })
  })

  it('should render disabled buttons (reload, mark all as read, load more) when loading is true', async () => {
    // @ts-ignore
    const {getByText, getByRole} = render(<NotificationCenter loading={true} notifications={[]}/>)
    const button = getByRole(/button/i)
    fireEvent.click(button)

    await waitFor(() => {
      expect(getByText('reload')).toBeInTheDocument()
      expect(getByText('loadingButton')).toBeInTheDocument()
      expect(getByText('readAll')).toBeInTheDocument()
      expect(getByText('reload').classList.value.includes('ant-typography-disabled')).toBeTruthy()
      expect(getByText('loadingButton').classList.value.includes('ant-typography-disabled')).toBeTruthy()
      expect(getByText('readAll').classList.value.includes('ant-typography-disabled')).toBeTruthy()
    })
  })

  it('should render no notification message', async () => {
    // @ts-ignore
    const {getByText, getByRole} = render(<NotificationCenter notifications={[]}/>)
    const button = getByRole(/button/i)
    fireEvent.click(button)

    await waitFor(() => {
      expect(getByText('noNotification')).toBeInTheDocument()
    })
  })

  it('should render correct notifications', async () => {
    const notifications = genNotifications(3)
    // @ts-ignore
    const {getByRole, getByText} = render(<NotificationCenter notifications={notifications}/>)
    const button = getByRole(/button/i)
    fireEvent.click(button)

    await waitFor(() => {
      notifications.forEach((x) => {
        expect(getByText(x.title)).toBeInTheDocument()
      })
    })
  })
})