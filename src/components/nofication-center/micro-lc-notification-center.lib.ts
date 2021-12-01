import {Notification} from '../../lib'
import {getNotifications, patchAllReadState, patchReadState} from '../../utils/notificationsClient'
import {MicroLcNotificationCenter} from './micro-lc-notification-center'

/**
 * Patches `readState` of a given notification and keeps track 
 * inside the notification array without re-fetching after successful request
 * @param this the `micro-lc-notification-center` webcomponent instance
 * @param notification the notification to patch 
 * @param index the index inside the notifications array
 * @returns an empty promise
 */
async function onClick (this: MicroLcNotificationCenter, {readState, ...rest}: Notification, index: number): Promise<void> {
  if(!readState) {
    const newReadState = !readState
    return await patchReadState.bind(this)(rest._id, newReadState).then(() => {
      this.notifications = [
        ...this.notifications.slice(0, index), 
        {...rest, readState: newReadState},
        ...this.notifications.slice(index + 1)
      ]
    })
  }
}

/**
 * Patches `readState` for all notifications and keeps track 
 * inside the notification array without re-fetching after successful request
 * @param this the `micro-lc-notification-center` webcomponent instance
 * @returns a promise with the number of modified entries
 */
async function onClickAll (this: MicroLcNotificationCenter): Promise<number> {
  return await patchAllReadState.bind(this)().then((res: number) => {
    this.notifications = this.notifications.map((el) => {
        el.readState = true
        return el
      })
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
async function loadNotifications(this: MicroLcNotificationCenter, reload = false): Promise<void> {
  const skip = reload ? 0 : this.page.skip
  this.loading = true
  this.done = false 
  return await getNotifications.bind(this)(skip).then((notifications: Notification[]) => {
    this.error = false
    this.notifications = reload ? notifications : [...this.notifications, ...notifications]
    this.page = {skip: skip + this.limit, last: skip}

    if(notifications.length === 0 || notifications.length < this.limit) {
      this.done = true
    }
  }).catch(() => {
    this.error = true
  }).finally(() => {
    this.loading = false
  })
}

export {onClick, onClickAll, loadNotifications}
