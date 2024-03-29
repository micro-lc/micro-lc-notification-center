import React from 'react'

import {
  ByRoleMatcher,
  ByRoleOptions,
  fireEvent,
  render,
} from '@testing-library/react'

import {
  NotificationCenter,
  Notification,
  NotificationCenterProps,
} from '../NotificationCenter'
import {defaultTranslations as d} from '../../../micro-lc-notification-center.lib'
import {DefaultTranslations} from '../../../utils/i18n'

const START_DAYS_AGO = 90
const today = new Date()
const startFrom = new Date(today.getTime())
startFrom.setTime(today.getTime() - START_DAYS_AGO * 24 * 60 * 60 * 1000)

function genId () {
  const timestamp = (new Date().getTime() / 1000 | 0).toString(16)
  return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
    return (Math.random() * 16 | 0).toString(16)
  }).toLowerCase()
}

function randomDate (start = startFrom, end = today) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString()
}

function randomString (length = 10) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

const genNotifications = (quantity: number): Notification[] => Array(quantity).fill(0).map(() => ({
  _id: genId(),
  creatorId: genId(),
  createdAt: randomDate(),
  title: randomString(),
  readState: false,
  content: randomString(100),
  onClickCallback: {
    content: `?_q=${randomString(5)}`
  }
}))

const randomNumber = (start = 0, end = 10) => Math.floor(Math.random() * end) + start

// const getLinkSpy = jest.spyOn(undefined, 'getLink').mockImplementation(() => {
//   const a = document.createElement('a')
//   a.click = jest.fn()
//   return a
// })

const defaultProps: NotificationCenterProps = {
  next: () => {},
  reload: async () => {},
  locales: d,
  error: false,
  notifications: [],
  onClick: async () => {},
  onClickAll: async () => {
    return 0
  },
  done: false,
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
  
  it('should render notifications and then invoke onClick handler on one of them', () => {
    const onClick = jest.fn()
    const {getByRole, getByText} = render(
      <NotificationCenter
        {...defaultProps}
        onClick={onClick}
        notifications={notifications}
        unread={1}
      />
    )
    clickOnNotificationCenterIcon(getByRole)

    const n = getByText(notifications[0].title)
    n.click()

    expect(onClick).toBeCalled()
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
    const locales: DefaultTranslations = {
      title: 'Notifiche',
      dateFormat: 'DD MMM YYYY',
      loadingButton: 'Carica altro',
      errorMessage: 'Si è verificato un errore, riprovare',
      noNotification: 'Nessuna notifica da visualizzare',
      readAll: 'Segna tutte come lette',
      reload: 'Ricarica',
      backOnTop: 'Torna su'
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
    const locales = {
      readAll: 'Segna tutte come lette',
    } as unknown as DefaultTranslations
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
