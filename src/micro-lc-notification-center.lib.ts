import type {Notification, NotificationCenterProps} from './react-components'
import {DefaultTranslations, translate} from './utils/i18n'
import type {
  ClickStrategies,
  LocalizedNotification,
  MicroLcNotificationCenter
} from './micro-lc-notification-center'
import type {HttpClient} from './utils/client'
import {getLang} from './locale'
import {getLink} from './utils/link'

export const defaultTranslations: DefaultTranslations = {
  title: 'Notifications',
  loadingButton: 'Load More',
  dateFormat: 'YYYY-MM-DD',
  noNotification: 'No notification to show',
  errorMessage: 'An error occurred, try again',
  readAll: 'Mark all as read',
  reload: 'Reload',
  backOnTop: 'Back on top',
}

function handleClick (
  this: MicroLcNotificationCenter,
  clickStrategy: ClickStrategies,
  pushStateKey: string,
  content: string | Record<string, any>,
  allowExternalHrefs = false,
  linkTarget = '_self'
): void {
  if (clickStrategy === 'push') {
    const {
      state
    } = window.history

    const data = typeof state === 'object' ? {...state} : {}
    let url: URL | string | undefined
    if(typeof content === 'string') {
      url = content
    } else if (content.url || content.data) {
      const {url: u, data: d} = content as Record<string, any>
      d && (data[pushStateKey] = d)
      u && (url = u as string | URL)
    }

    window.history.pushState(data, '', url)
    return
  }

  if (typeof content === 'string') {
    const link = getLink.call(this, content, allowExternalHrefs, linkTarget)
    switch (clickStrategy) {
    case 'replace':
      window.location.replace(link.href)
      break
    case 'href':
    case 'default':
    default:
      link.click()
      break
    }
  }
}

function localizeNotifications (notifications: LocalizedNotification[]): Notification[] {
  return notifications.map(({title: incomingTitle, content: incomingContent, ...rest}) => {
    let title: string
    let content: string | undefined
    if (typeof incomingTitle === 'string') {
      title = incomingTitle
    } else if (incomingTitle === undefined) {
      title = ''
    } else {
      title = translate(incomingTitle)
    }

    if (incomingContent === undefined) {
      content = undefined
    } else if (typeof incomingContent === 'string') {
      content = incomingContent
    } else {
      content = translate(incomingContent)
    }

    return {title, content, ...rest}
  })
}

/**
 * Patches `readState` of a given notification and keeps track
 * inside the notification array without re-fetching after successful request
 * @param this the `micro-lc-notification-center` webcomponent instance
 * @param notification the notification to patch
 * @param index the index inside the notifications array
 * @returns an empty promise
 */
async function onClick (this: MicroLcNotificationCenter, {readState, ...rest}: Notification, index: number): Promise<void> {
  if (!readState) {
    const newReadState = !readState
    await this.httpClient.patchReadState(rest._id, newReadState).then(() => {
      this.notifications = [
        ...this.notifications.slice(0, index),
        {...rest, readState: newReadState},
        ...this.notifications.slice(index + 1)
      ]
      this.unread--
    })
  }

  const {onClickCallback} = rest
  const {clickStrategy, pushStateKey, allowExternalHrefs, linkTarget} = this
  if (onClickCallback && onClickCallback.content) {
    return handleClick.call(this, clickStrategy, pushStateKey, onClickCallback.content, allowExternalHrefs, linkTarget)
  }
}

/**
 * Patches `readState` for all notifications and keeps track
 * inside the notification array without re-fetching after successful request
 * @param this the `micro-lc-notification-center` webcomponent instance
 * @returns a promise with the number of modified entries
 */
async function onClickAll (this: MicroLcNotificationCenter): Promise<number | void> {
  return await this.httpClient.patchAllReadState().then((res) => {
    this.notifications = this.notifications.map((el) => {
      el.readState = true
      return el
    })
    this.unread = 0

    return res
  })
}

/**
 * Fetches notfications from paginated source.
 * The `reload` flag prevents advancing though unless is
 * explicitly set to `true`
 * @param this the `micro-lc-notification-center` webcomponent instance
 * @param client the client performing HTTP calls
 * @param reload a boolean flag to trigger reload (default to false)
 * @returns
 */
export async function loadNotifications (this: MicroLcNotificationCenter, client: HttpClient, reload: boolean | 'keep-limit' = false): Promise<void> {
  const skip = reload ? 0 : this.page.skip
  this.loading = true
  this.done = false

  const lang = getLang()
  let limit = this.limit
  if (reload === 'keep-limit' && this.notifications.length > 0) {
    const extra = (this.notifications.length % this.limit === 0) ? 0 : 1
    limit = (Math.floor(this.notifications.length / this.limit) + extra) * this.limit
  }

  return Promise.allSettled([
    client.getNotifications(skip, lang, limit),
    client.getCounts()
  ]).then(([notRes, countsRes]) => {
    if (notRes.status === 'fulfilled') {
      const notifications = localizeNotifications(notRes.value)
      this.error = false
      this.notifications = reload ? notifications : [...this.notifications, ...notifications]
      this.page = {skip: skip + this.limit, last: skip}

      if (notifications.length === 0 || notifications.length < this.limit) {
        this.done = true
      }
    } else if (notRes.status === 'rejected') {
      this.error = true
    }

    if (countsRes.status === 'fulfilled') {
      const {count, unread} = countsRes.value
      this.count = count
      this.unread = unread
      if (count !== undefined && this.notifications.length === count) {
        this.done = true
      }
    }
  }).finally(() => {
    this.loading = false
  })
}

/**
 * Sets up automatic fetching of notifications accordingly to 'mode' property.
 * @param this the `micro-lc-notification-center` webcomponent instance
 * @param client the client performing HTTP calls
 * @returns
 */
export function autoFetchData (this: MicroLcNotificationCenter, client: HttpClient) {
  const {mode, pollingFrequency} = this
  
  if (mode === 'polling') {
    this.pollingTimer = setInterval(() => loadNotifications.call(this, client, 'keep-limit') , pollingFrequency)
  }
}

/**
 * Bind `this` to match react element props
 * @returns react element props
 */
export function createProps(this: MicroLcNotificationCenter): NotificationCenterProps {
  const props: NotificationCenterProps = {
    notifications: this.notifications,
    next: this.httpClient && loadNotifications.bind(this, this.httpClient, false),
    reload: this.httpClient && loadNotifications.bind(this, this.httpClient, true),
    locales: this._locales,
    error: this.error,
    done: this.done,
    onClick: onClick.bind(this),
    onClickAll: onClickAll.bind(this)
  }

  if (this.loading !== undefined) {
    props.loading = this.loading
  }
  if (this.count !== undefined) {
    props.count = this.count
  }
  if (this.unread !== undefined) {
    props.unread = this.unread
  }

  return props
}
