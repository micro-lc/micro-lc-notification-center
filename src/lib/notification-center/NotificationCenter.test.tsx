import React from 'react'

import {ByRoleMatcher, ByRoleOptions, fireEvent, render, waitFor} from '@testing-library/react'

import {genNotifications, randomNumber} from '../utils/test.utils'
import NotificationCenter, {defaultTranslations as d, Notification, NotificationCenterProps} from './NotificationCenter'

const defaultProps: NotificationCenterProps = {
  next: () => {},
  reload: () => {},
  locales: {},
  error: false,
  notifications: [],
  onClick: async () => {},
  onClickAll: async () => { return 0 },
  done: false
}

function clickOnNotificationCenterIcon (getByRole: (role: ByRoleMatcher, options?: ByRoleOptions) => HTMLElement): boolean {
  const button = getByRole(/button/i)
  return fireEvent.click(button)
}
describe('NotificationCenter tests', () => {
  let notifications: Notification[]
  let notificationsLength: number
  beforeEach(() => {
    const num = randomNumber(3, 10)
    notifications = genNotifications(num)
    notificationsLength = num
  })

  it('should render with notifications', async () => {
    const {getByRole, getAllByRole, getByText} = render(<NotificationCenter {...defaultProps} notifications={notifications} unread={1}/>)
    clickOnNotificationCenterIcon(getByRole)

    await waitFor(() => {
      const headers = getAllByRole(/heading/i)
      expect(headers).toHaveLength(1)
      expect(headers[0].innerHTML).toMatch(d.title)
      expect(getByText(d.reload)).toBeInTheDocument()
      expect(getByText(d.loadingButton)).toBeInTheDocument()
      expect(getByText(d.readAll)).toBeInTheDocument()
    })
  })

  it('should render loadingButton when done is false', async () => {
    const {getByText, getByRole} = render(<NotificationCenter {...defaultProps} done={false} notifications={[]}/>)
    clickOnNotificationCenterIcon(getByRole)

    await waitFor(() => {
      expect(getByText(d.loadingButton)).toBeInTheDocument()
    })
  })

  it('should render markAsRead button when there is at least one unread notification', async () => {
    const {getByText, getByRole} = render(<NotificationCenter {...defaultProps} done={false} notifications={notifications} unread={1}/>)
    clickOnNotificationCenterIcon(getByRole)

    await waitFor(() => {
      expect(getByText(d.readAll)).toBeInTheDocument()
    })
  })

  it('should not render markAsRead button when there is no unread notification', async () => {
    const {queryByText, getByRole} = render(<NotificationCenter {...defaultProps} done={false} notifications={notifications} unread={0}/>)
    clickOnNotificationCenterIcon(getByRole)

    await waitFor(() => {
      expect(queryByText(d.readAll)).toBeNull()
    })
  })

  it('should render errorMessage when error flag is true', async () => {
    const {getByText, getByRole} = render(<NotificationCenter {...defaultProps} error={true} notifications={[]}/>)
    clickOnNotificationCenterIcon(getByRole)

    await waitFor(() => {
      expect(getByText(d.errorMessage)).toBeInTheDocument()
    })
  })

  it('should render no notification message', async () => {
    const {getByText, getByRole} = render(<NotificationCenter {...defaultProps} notifications={[]}/>)
    clickOnNotificationCenterIcon(getByRole)

    await waitFor(() => {
      expect(getByText(d.noNotification)).toBeInTheDocument()
    })
  })

  it('should render correct notifications', async () => {
    const {getByRole, getByText} = render(<NotificationCenter {...defaultProps} notifications={notifications}/>)
    clickOnNotificationCenterIcon(getByRole)

    await waitFor(() => {
      notifications.forEach((notification) => {
        expect(getByText(notification.title)).toBeInTheDocument()
      })
    })
  })

  it('should render badge for unread notifications', async () => {
    notifications[0].readState = true
    const {getByRole, getAllByTestId} = render(<NotificationCenter {...defaultProps} notifications={notifications}/>)
    clickOnNotificationCenterIcon(getByRole)
    const notificationsEntry = getAllByTestId('notification-row')
    const notificationsBadge = getAllByTestId('notification-badge')
    await waitFor(() => {
      expect(notificationsEntry).toHaveLength(notificationsLength)
      expect(notificationsBadge).toHaveLength(notificationsLength)
      notifications.forEach((n, i) => {
        // Should render the badge (notificationsBadge[i] has children) when readState is false
        expect(notificationsBadge[i].children.length > 0).toBe(!n.readState)
      })
    })
  })

  it('handle click on unread notification', async () => {
    const onClick = jest.fn().mockImplementation(() => {
      notifications[1].readState = true
    })
    const {getByRole, getAllByTestId, rerender} = render(<NotificationCenter {...defaultProps} notifications={notifications} onClick={onClick}/>)
    clickOnNotificationCenterIcon(getByRole)
    const notificationsEntry = getAllByTestId('notification-row')
    await waitFor(() => {
      expect(notificationsEntry).toHaveLength(notificationsLength)
    })

    fireEvent.click(notificationsEntry[1])
    rerender(<NotificationCenter {...defaultProps} notifications={notifications}/>)
    const notificationsBadge = getAllByTestId('notification-badge')

    await waitFor(() => {
      expect(onClick).toHaveBeenCalledTimes(1)
      expect(notificationsBadge[1].children).toHaveLength(0)
    })
  })

  it('should render disabled buttons (reload, mark all as read, load more) when loading is true', async () => {
    const defaultLanguage = window.navigator.language
    Object.defineProperty(window.navigator, 'language', {writable: true, value: 'it'})
    const locales = {
      title: {
        it: 'Notifiche'
      },
      dateFormat: {
        it: 'DD MMM YYYY'
      },
      loadingButton: {
        it: 'Carica altro'
      },
      errorMessage: {
        it: 'Si è verificato un errore, riprovare'
      },
      noNotification: {
        it: 'Nessuna notifica da visualizzare'
      },
      readAll: {
        it: 'Segna tutte come lette'
      },
      reload: {
        it: 'Ricarica'
      }
    }
    const {getByText, getByRole} = render(<NotificationCenter {...defaultProps} loading={true} locales={locales} notifications={notifications} unread={1}/>)
    clickOnNotificationCenterIcon(getByRole)

    await waitFor(() => {
      expect(getByText('Ricarica')).toBeInTheDocument()
      expect(getByText('Carica altro')).toBeInTheDocument()
      expect(getByText('Segna tutte come lette')).toBeInTheDocument()
      expect(getByText('Ricarica').classList.value.includes('ant-typography-disabled')).toBeTruthy()
      expect(getByText('Carica altro').classList.value.includes('ant-typography-disabled')).toBeTruthy()
      expect(getByText('Segna tutte come lette').classList.value.includes('ant-typography-disabled')).toBeTruthy()
    })
    Object.defineProperty(window.navigator, 'language', {writable: true, value: defaultLanguage})
  })

  it('should reload notifications when reload button is pressed', async () => {
    const reload = jest.fn()
    const {getByText, getByRole} = render(<NotificationCenter {...defaultProps} notifications={notifications} reload={reload}/>)
    clickOnNotificationCenterIcon(getByRole)

    fireEvent.click(getByText(/reload/i))
    await waitFor(() => {
      expect(reload).toHaveBeenCalledTimes(1)
    })
  })

  it('should load more notifications when loadMore button is pressed', async () => {
    const secondPageLength = randomNumber(1, 10)
    const loadMoreFunction = jest.fn().mockImplementation(() => {
      notificationsLength += secondPageLength
      notifications = [...notifications, ...genNotifications(secondPageLength)]
    })

    const {getByText, getByRole, getAllByTestId, rerender} = render(<NotificationCenter {...defaultProps} next={loadMoreFunction} notifications={notifications}/>)
    clickOnNotificationCenterIcon(getByRole)

    let notificationsEntry = getAllByTestId('notification-row')
    await waitFor(() => {
      expect(notificationsEntry).toHaveLength(notificationsLength)
    })

    const loadMoreButton = getByText(/load more/i)
    fireEvent.click(loadMoreButton)
    rerender(<NotificationCenter {...defaultProps} notifications={notifications}/>)

    notificationsEntry = getAllByTestId('notification-row')
    await waitFor(() => {
      expect(loadMoreFunction).toHaveBeenCalledTimes(1)
      expect(notificationsEntry).toHaveLength(notificationsLength)
    })
  })

  it('should mark all notifications as already read when readAll button is pressed', async () => {
    const defaultLanguage = window.navigator.language
    Object.defineProperty(window.navigator, 'language', {writable: true, value: 'it'})
    const locales = {
      readAll: {
        it: 'Segna tutte come lette'
      }
    }
    const readAllFunction = jest.fn().mockImplementation(() => {
      notifications.forEach((notification) => {
        notification.readState = true
      })
    })
    const {getByText, getByRole, getAllByTestId, queryByText, rerender} = render(<NotificationCenter {...defaultProps} locales={locales} notifications={notifications} onClickAll={readAllFunction} unread={notifications.length}/>)
    clickOnNotificationCenterIcon(getByRole)
    let notificationsEntry = getAllByTestId('notification-row')
    await waitFor(() => {
      expect(notificationsEntry).toHaveLength(notificationsLength)
    })

    const readAllButton = getByText('Segna tutte come lette')
    fireEvent.click(readAllButton)
    rerender(<NotificationCenter {...defaultProps} notifications={notifications}/>)
    notificationsEntry = getAllByTestId('notification-row')
    const notificationsBadge = getAllByTestId('notification-badge')
    await waitFor(() => {
      expect(readAllFunction).toHaveBeenCalledTimes(1)
      notificationsBadge.forEach((badge) => {
        expect(badge.children).toHaveLength(0)
      })
      expect(queryByText('Segna tutte come lette')).toBeNull()
    })
    Object.defineProperty(window.navigator, 'language', {writable: true, value: defaultLanguage})
  })
})
