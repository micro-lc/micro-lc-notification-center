import React from 'react'

import {h, Component, Host, Element, Prop, State} from '@stencil/core'
import ReactDOM from 'react-dom'

import {NotificationCenter, Notification, NotificationCenterProps} from '../../lib'
import {PartialTranslations} from '../../lib/utils/i18n.utils'
import {DEFAULT_PAGINATION_LIMIT, getNotifications} from '../../utils/notificationsClient'
import {MicroLcHeaders, Pagination} from './micro-lc-notification-center.types'

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
   * `endpoint` is the http client url to fetch notifications.
   * It can also be used as a plain attribute by setting
   * ```html
   * <body>
   *   <micro-lc-notification-center
   *     endpoint="https://example.com/my-notifications"
   *   ></micro-lc-notification-center>
   * </body>
   * ```
   */
  @Prop() endpoint: string
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
  /**
   * `limit` (optional) controls pagination limit 
   * while fetching notifications. It is also an HTML 
   * attribute.
   */
  @Prop() limit = DEFAULT_PAGINATION_LIMIT
  
  @State() notifications: Notification[] = []
  @State() loading: boolean | undefined
  @State() page: Pagination = {skip: 0}
  @State() error: boolean = false

  private wasDetached = false

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
        error: this.error
      }
    )
  }

  private renderToDOM(): void {
    ReactDOM.render(this.create(), this.element)
  }

  private async loadNotifications(page = 0, reload = true): Promise<void> {
    this.loading = true 
    const handler = getNotifications.bind(this) as (skip: number) => Promise<Notification[]>
    await handler(page)
      .then((notifications) => {
        this.error = false
        this.notifications = reload ? notifications : [...this.notifications, ...notifications]
        this.postRetrieval(page)
      })
      .catch(() => {
        this.error = true
      })
      .finally(() => {
        this.loading = false
      })
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
    if(this.endpoint) {
      this.loadNotifications()
    }
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
