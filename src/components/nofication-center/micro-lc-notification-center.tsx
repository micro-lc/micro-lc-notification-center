import React from 'react'

import {h, Component, Host, Element, Prop, State} from '@stencil/core'
import ReactDOM from 'react-dom'

import {NotificationCenter, Notification, NotificationCenterProps} from '../../lib'
import {PartialTranslations} from '../../lib/utils/i18n.utils'
import {DEFAULT_PAGINATION_LIMIT, getNotifications, patchReadState, patchAllReadState} from '../../utils/notificationsClient'
import {MicroLcHeaders, Pagination} from './micro-lc-notification-center.types'

const DEFAULT_MICRO_LC_NOTIFICATION_ENDPOINT = '/api/v1/micro-lc-notification-center'

/**
 * This is the micro-lc notification center web-component
 */
@Component({
  tag: 'micro-lc-notification-center',
  shadow: true
})
export class MicroLcNotificationCenter {
  @Element() element: HTMLElement

  /**
   * `endpoint` (optional) is the http client url to fetch notifications.
   * It defaults to relative ref: `/api/v1/micro-lc-notification-center`.
   * It can also be used as a plain attribute by setting
   * ```html
   * <body>
   *   <micro-lc-notification-center
   *     endpoint="https://example.com/my-notifications"
   *   ></micro-lc-notification-center>
   * </body>
   * ```
   */
  @Prop() endpoint = DEFAULT_MICRO_LC_NOTIFICATION_ENDPOINT
  /**
   * `limit` (optional) controls pagination limit 
   * while fetching notifications. It is also an HTML 
   * attribute.
   */
  @Prop() limit = DEFAULT_PAGINATION_LIMIT
  /**
   * `headers` (optional) is a key-value list of 
   * http headers to attach to the http client that
   * fetches notifications
   */
  @Prop() headers: MicroLcHeaders = {}
  /**
   * `locales` (optional) is a key-value list to 
   * allow i18n support. Keys are paired to either a string,
   * which overrides language support or to a key-value map
   * that matches a language to a translation
   * 
   * ```javascript
   * const locales = {
   *   title: "A Title",
   *   subtitle: {
   *     en: "A i18n subtitle",
   *     it-IT: "Un sottotitolo internazionalizzato"
   *   }
   * }
   * ```
   */
  @Prop() locales: PartialTranslations = {}
  
  @State() notifications: Notification[] = []
  @State() loading?: boolean
  @State() page: Pagination = {skip: 0}
  @State() error = false
  @State() done = false

  private wasDetached = false

  private fetch: (skip: number) => Promise<Notification[]> = getNotifications.bind(this)

  private async loadNotifications(page = 0, reload = true): Promise<void> {
    this.loading = true
    this.done = false 
    await this.fetch(page)
      .then((notifications) => {
        this.error = false
        this.notifications = reload ? notifications : [...this.notifications, ...notifications]
        this.postRetrieval(page)

        if(notifications.length === 0 || notifications.length < this.limit) {
          this.done = true
        }
      })
      .catch(() => {
        this.error = true
      })
      .finally(() => {
        this.loading = false
      })
  }

  private postRetrieval(skipDone: number): void {
    this.page = {skip: skipDone + this.limit, last: skipDone}
  }

  private create(): React.FunctionComponentElement<NotificationCenterProps> {
    return React.createElement(
      NotificationCenter, {
        loading: this.loading, 
        notifications: this.notifications,
        next: () => this.loadNotifications(this.page.skip, false),
        reload: () => this.loadNotifications(0, true),
        locales: this.locales,
        error: this.error,
        done: this.done,
        onClick: async ({readState, ...rest}: Notification, index: number) => {
          if(!readState) {
            const newReadState = !readState
            return await patchReadState.bind(this)(rest._id, newReadState)
              .then(() => {
                this.notifications = [
                  ...this.notifications.slice(0, index), 
                  {...rest, readState: newReadState},
                  ...this.notifications.slice(index + 1)
                ]
              })
          }
        },
        onClickAll: async () => {
          const number = patchAllReadState.bind(this)()
            .then((res: number) => {
              this.notifications = this.notifications.map((el) => {
                  el.readState = true
                  return el
                })
              return res
            })
          return number
        }
      }
    )
  }

  private renderToDOM(): void {
    ReactDOM.render(this.create(), this.element)
  }

  connectedCallback() {
    /** 
     * There's no need of rendering when attaching the component.
     * If the component is disconnected and then re-connected a single
     * re-render is needed in order to re-apply the shadowed React component within
     */
    if(this.wasDetached) {
      this.renderToDOM()
    }
  }

  componentWillLoad() {
    /**
     * Performs a notification refresh only on first render.
     * If the component is disconnected and re-connected this 
     * step is not needed since it memory content is not erased
     */
    this.loadNotifications()
  }
  
  componentDidRender() {
    this.renderToDOM()
  }

  disconnectedCallback() {
    this.wasDetached = true
    ReactDOM.unmountComponentAtNode(this.element)
  }

  render() { 
    return h(Host, null, h('slot'))
  }
}
