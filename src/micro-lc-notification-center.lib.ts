import type {Notification, NotificationCenterProps} from './react-components'
import {translate} from './utils/i18n'
import type {LocalizedNotification, MicroLcNotificationCenter} from './micro-lc-notification-center'
import {HttpClient} from './utils/client'

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
    return await this.httpClient.patchReadState(rest._id, newReadState).then(() => {
      this.notifications = [
        ...this.notifications.slice(0, index),
        {...rest, readState: newReadState},
        ...this.notifications.slice(index + 1)
      ]
      this.unread--
    })
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
 * @param reload a boolean flag to trigger reload (default to true)
 * @returns
 */
export async function loadNotifications (this: MicroLcNotificationCenter, client: HttpClient, reload = false): Promise<void> {
  const skip = reload ? 0 : this.page.skip
  this.loading = true
  this.done = false
  Promise.allSettled([
    client.getNotifications(skip),
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
 * Bind `this` to match react element props
 * @returns react element props
 */
export function createProps(this: MicroLcNotificationCenter): NotificationCenterProps {
  const props: NotificationCenterProps = {
    notifications: this.notifications,
    next: this.httpClient && loadNotifications.bind(this, this.httpClient, false),
    reload: this.httpClient && loadNotifications.bind(this, this.httpClient, true),
    locales: this.locales,
    error: this.error,
    done: this.done,
    onClick: onClick.bind(this),
    onClickAll: onClickAll.bind(this),
    clickStrategy: this.clickStrategy
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