import {h, Component, Host, Element, Prop, State} from '@stencil/core'

import {NotificationCenter, Notification, NotificationCenterProps} from '../../lib'
import {PartialTranslations} from '../../lib/utils/i18n.utils'
import {DEFAULT_PAGINATION_LIMIT} from '../../utils/notificationsClient'
import {reactRender, unmountComponentAtNode, Creatable, shadowRootCSS} from '../engine'
import {loadNotifications, onClick, onClickAll} from './micro-lc-notification-center.lib'

const DEFAULT_MICRO_LC_NOTIFICATION_ENDPOINT = '/api/v1/micro-lc-notification-center'

type Pagination = {
  skip: number
  last?: number
}

export type MicroLcHeaders = Record<string, string>

/**
 * This is the micro-lc notification center web-component
 */
@Component({
  tag: 'micro-lc-notification-center',
  shadow: true
})
export class MicroLcNotificationCenter implements Creatable<NotificationCenterProps> {
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
   *   title: 'A Title',
   *   subtitle: {
   *     en: 'A i18n subtitle',
   *     'it-IT': 'Un sottotitolo internazionalizzato'
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

  /**
   * React fields
   */
  Component = NotificationCenter
  wasDetached = false
  rerender = reactRender.bind(this)
  unmount = unmountComponentAtNode.bind(this)
  shadowRootCSS = shadowRootCSS.bind(this)

  /**
   * Component fields
   */
  next = loadNotifications.bind(this, false)
  reload = loadNotifications.bind(this, true)
  onClick = onClick.bind(this)
  onClickAll = onClickAll.bind(this)

  /**
   * Bind `this` to match react element props
   * @returns react element props
   */
  create(): NotificationCenterProps {
    return {
      loading: this.loading, 
      notifications: this.notifications,
      next: this.next,
      reload: this.reload,
      locales: this.locales,
      error: this.error,
      done: this.done,
      onClick: this.onClick, 
      onClickAll: this.onClickAll
    }
  }

  connectedCallback() {
    this.shadowRootCSS('micro-lc-notification-center-style')
    /** 
     * There's no need of rendering when attaching the component.
     * If the component is disconnected and then re-connected a single
     * re-render is needed in order to re-apply the shadowed React component within
     */
    this.rerender(this.wasDetached)
  }

  componentWillLoad() {
    /**
     * Performs a notification refresh only on first render.
     * If the component is disconnected and re-connected this 
     * step is not needed since it memory content is not erased
     */
    this.next()
  }
  
  disconnectedCallback() {
    this.unmount()
  }

  render() {
    const host = h(Host, null, h('slot'))
    this.rerender()
    return host
  }
}
