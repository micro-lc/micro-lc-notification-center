import React from 'react'

import {
  ByRoleMatcher,
  ByRoleOptions,
  fireEvent,
  render,
  waitFor,
} from '@testing-library/react'

import {genNotifications, randomNumber} from './utils'
import * as urlUtils from '../../utils/url'
import {
  defaultTranslations as d,
  NotificationCenter,
  Notification,
  NotificationCenterProps,
} from '../NotificationCenter'
import type {ClickStrategies} from '../../../micro-lc-notification-center'

const getLinkSpy = jest.spyOn(urlUtils, 'getLink').mockImplementation(() => {
  const a = document.createElement('a')
  a.click = jest.fn()
  return a
})

const defaultProps: NotificationCenterProps = {
  next: () => {},
  reload: () => {},
  locales: {},
  error: false,
  notifications: [],
  onClick: async () => {},
  onClickAll: async () => {
    return 0
  },
  done: false,
  clickStrategy: 'default',
}

function clickOnNotificationCenterIcon(
  getByRole: (role: ByRoleMatcher, options?: ByRoleOptions) => HTMLElement
): boolean {
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

  it('should render with notifications', () => {
    const {getByRole, getAllByRole, getByText} = render(
      <NotificationCenter
        {...defaultProps}
        notifications={notifications}
        unread={1}
      />
    )
    clickOnNotificationCenterIcon(getByRole)

    const [title] = getAllByRole(/heading/i)
    expect(title.innerHTML).toMatch(d.title)
    expect(getByText(d.reload)).toBeInTheDocument()
    expect(getByText(d.loadingButton)).toBeInTheDocument()
    expect(getByText(d.readAll)).toBeInTheDocument()
  })

  it('should render `loadingButton` when `done` is false', () => {
    const {getByText, getByRole} = render(
      <NotificationCenter {...defaultProps} done={false} notifications={[]} />
    )
    clickOnNotificationCenterIcon(getByRole)

    expect(getByText(d.loadingButton)).toBeInTheDocument()
  })

  it('should render `backOnTop` when `done` is true', () => {
    const {getByText, getByRole} = render(
      <NotificationCenter {...defaultProps} done notifications={[]} />
    )
    clickOnNotificationCenterIcon(getByRole)

    expect(getByText(d.backOnTop)).toBeInTheDocument()
  })

  it('should render `backOnTop` on on click reach the top of the list', () => {
    const {getByText, getByRole, getByTestId} = render(
      <NotificationCenter {...defaultProps} done notifications={[]} />
    )
    clickOnNotificationCenterIcon(getByRole)

    const scrollTo = jest.fn()
    const container = getByTestId('notifications-container')
    Object.defineProperty(container, 'scrollTo', {value: scrollTo})
    fireEvent.click(getByText(d.backOnTop))

    expect(scrollTo).toBeCalledWith(0, 0)
  })

  it('should render markAsRead button when there is at least one unread notification', () => {
    const {getByText, getByRole} = render(
      <NotificationCenter
        {...defaultProps}
        done={false}
        notifications={notifications}
        unread={1}
      />
    )
    clickOnNotificationCenterIcon(getByRole)

    expect(getByText(d.readAll)).toBeInTheDocument()
  })

  it('should not render markAsRead button when there is no unread notification', () => {
    const {queryByText, getByRole} = render(
      <NotificationCenter
        {...defaultProps}
        done={false}
        notifications={notifications}
        unread={0}
      />
    )
    clickOnNotificationCenterIcon(getByRole)

    expect(queryByText(d.readAll)).toBeNull()
  })

  it('should render errorMessage when error flag is true', () => {
    const {getByText, getByRole} = render(
      <NotificationCenter {...defaultProps} error={true} notifications={[]} />
    )
    clickOnNotificationCenterIcon(getByRole)

    expect(getByText(d.errorMessage)).toBeInTheDocument()
  })

  it('should render no notification message', () => {
    const {getByText, getByRole} = render(
      <NotificationCenter {...defaultProps} notifications={[]} />
    )
    clickOnNotificationCenterIcon(getByRole)

    expect(getByText(d.noNotification)).toBeInTheDocument()
  })

  it('should render correct notifications', () => {
    const {getByRole, getByText} = render(
      <NotificationCenter {...defaultProps} notifications={notifications} />
    )
    clickOnNotificationCenterIcon(getByRole)

    notifications.forEach((notification) => {
      expect(getByText(notification.title)).toBeInTheDocument()
      expect(getByText(notification.content)).toBeInTheDocument()
    })
  })

  it('should render badge for unread notifications', () => {
    notifications[0].readState = true
    const {getByRole, getAllByTestId} = render(
      <NotificationCenter {...defaultProps} notifications={notifications} />
    )
    clickOnNotificationCenterIcon(getByRole)
    expect(getAllByTestId('notification-row')).toHaveLength(
      notificationsLength
    )

    const notificationsBadge = getAllByTestId('notification-badge')
    expect(notificationsBadge).toHaveLength(notificationsLength)
    notifications.forEach((n, i) => {
      expect(notificationsBadge[i].children.length > 0).toBe(!n.readState)
    })
  })

  it.each<[ClickStrategies]>([['default'], ['href']])(
    'handle click on unread notification with % strategy',
    async (strategy) => {
      const onClick = jest.fn().mockResolvedValue(undefined)
      const {getByRole, getAllByTestId} = render(
        <NotificationCenter
          {...defaultProps}
          clickStrategy={strategy}
          notifications={notifications}
          onClick={onClick}
        />
      )
      clickOnNotificationCenterIcon(getByRole)

      const [notificationsEntry] = getAllByTestId('notification-row')
      fireEvent.click(notificationsEntry)
      expect(onClick).toHaveBeenCalledTimes(1)
      await waitFor(() => {
        expect(getLinkSpy.mock.results[0].value.click).toHaveBeenCalledTimes(1)
      })
    }
  )

  it('handle click on unread notification with replace strategy', async () => {
    const actualLocation = window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {replace: jest.fn()},
    })
    const onClick = jest.fn().mockResolvedValue(undefined)
    const {getByRole, getAllByTestId} = render(
      <NotificationCenter
        {...defaultProps}
        clickStrategy="replace"
        notifications={notifications}
        onClick={onClick}
      />
    )
    clickOnNotificationCenterIcon(getByRole)

    const [notificationsEntry] = getAllByTestId('notification-row')
    fireEvent.click(notificationsEntry)
    expect(onClick).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(window.location.replace).toHaveBeenCalledTimes(1)
    })
    Object.defineProperty(window, 'location', {
      writable: true,
      value: actualLocation,
    })
  })

  it('handle click on unread notification with push strategy', async () => {
    const actualHistory = window.history
    Object.defineProperty(window, 'history', {
      writable: true,
      value: {pushState: jest.fn()},
    })
    const onClick = jest.fn().mockResolvedValue(undefined)
    const {getByRole, getAllByTestId} = render(
      <NotificationCenter
        {...defaultProps}
        clickStrategy="push"
        notifications={notifications}
        onClick={onClick}
      />
    )
    clickOnNotificationCenterIcon(getByRole)

    const [notificationsEntry] = getAllByTestId('notification-row')
    fireEvent.click(notificationsEntry)
    expect(onClick).toHaveBeenCalledTimes(1)
    await waitFor(() => {
      expect(window.history.pushState).toHaveBeenCalledTimes(1)
    })
    Object.defineProperty(window, 'history', {
      writable: true,
      value: actualHistory,
    })
  })

  it('should reload notifications when reload button is pressed', () => {
    const reload = jest.fn()
    const {getByText, getByRole} = render(
      <NotificationCenter
        {...defaultProps}
        notifications={notifications}
        reload={reload}
      />
    )
    clickOnNotificationCenterIcon(getByRole)

    fireEvent.click(getByText(/reload/i))
    expect(reload).toHaveBeenCalledTimes(1)
  })

  it('should load more notifications when loadMore button is pressed', () => {
    const loadMoreFunction = jest.fn()
    const {getByText, getByRole} = render(
      <NotificationCenter
        {...defaultProps}
        next={loadMoreFunction}
        notifications={notifications}
      />
    )
    clickOnNotificationCenterIcon(getByRole)

    const loadMoreButton = getByText(/load more/i)
    fireEvent.click(loadMoreButton)
    expect(loadMoreFunction).toHaveBeenCalledTimes(1)
  })
})

describe('tests involving DOM mocks', () => {
  let defaultLanguage: string

  beforeEach(() => {
    defaultLanguage = window.navigator.language
    Object.defineProperty(window.navigator, 'language', {
      writable: true,
      value: 'it',
    })
  })

  afterEach(() => {
    Object.defineProperty(window.navigator, 'language', {
      writable: true,
      value: defaultLanguage,
    })
  })

  it('should render disabled buttons (reload, mark all as read, load more) when loading is true', async () => {
    const locales: NotificationCenterProps['locales'] = {
      title: {
        it: 'Notifiche',
      },
      dateFormat: {
        it: 'DD MMM YYYY',
      },
      loadingButton: {
        it: 'Carica altro',
      },
      errorMessage: {
        it: 'Si è verificato un errore, riprovare',
      },
      noNotification: {
        it: 'Nessuna notifica da visualizzare',
      },
      readAll: {
        it: 'Segna tutte come lette',
      },
      reload: {
        it: 'Ricarica',
      },
    }
    const {getByText, getByRole} = render(
      <NotificationCenter {...defaultProps} loading={true} locales={locales} />
    )
    clickOnNotificationCenterIcon(getByRole)

    expect(getByText('Ricarica')).toBeInTheDocument()
    expect(getByText('Carica altro')).toBeInTheDocument()
    expect(getByText('Nessuna notifica da visualizzare')).toBeInTheDocument()
  })

  it('should mark all notifications as already read when readAll button is pressed', () => {
    const locales: NotificationCenterProps['locales'] = {
      readAll: {
        it: 'Segna tutte come lette',
      },
    }
    const readAllFunction = jest.fn()
    const {getByText, getByRole} = render(
      <NotificationCenter
        {...defaultProps}
        locales={locales}
        notifications={genNotifications(1)}
        onClickAll={readAllFunction}
        unread={1}
      />
    )
    clickOnNotificationCenterIcon(getByRole)

    fireEvent.click(getByText('Segna tutte come lette'))
    expect(readAllFunction).toHaveBeenCalledTimes(1)
  })
})
