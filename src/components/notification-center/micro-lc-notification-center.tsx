import {Component, Element, Prop, State, VNode} from '@stencil/core'

import {NotificationCenter, Notification, NotificationCenterProps} from '../../lib'
import {LocalizedString, PartialTranslations} from '../../lib/utils/i18n.utils'
import {DEFAULT_PAGINATION_LIMIT} from '../../utils/notificationsClient'
import {reactRender, unmountComponentAtNode, Creatable, shadowRootCSS, disconnectedCallback, render} from '../engine'
import {loadNotifications, onClick, onClickAll} from './micro-lc-notification-center.lib'

const DEFAULT_MICRO_LC_NOTIFICATION_ENDPOINT = '/api/v1/micro-lc-notification-center'

type Pagination = {
  skip: number
  last?: number
}

export type MicroLcHeaders = Record<string, string>
export type ClickStrategies = 'default' | 'href' | 'replace' | 'push'
export type CallbackHref = {
  kind: 'href' | string
  content: string
}
export type LocalizedNotification = {
  _id: string
  creatorId: string
  createdAt: string
  title: LocalizedString
  readState?: boolean
  content?: LocalizedString
  onClickCallback?: CallbackHref
}

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

  /**
   * `clickStrategy` (optional) is an enum taking values
   * 'default' | 'href' | 'replace' | 'push' which correspond to
   * what happens when a notification is clicked. Default and href do create
   * an `anchor` and click it. `replace` triggers the location replace
   * while `push` pushes onto window.history stack
   */
  @Prop() clickStrategy: ClickStrategies = 'default'

  @State() notifications: Notification[] = []
  @State() loading?: boolean
  @State() page: Pagination = {skip: 0}
  @State() error = false
  @State() done = false
  @State() count?: number
  @State() unread?: number

  /**
   * React fields
   */
  Component = NotificationCenter
  wasDetached = false
  rerender = reactRender.bind<((conditionalRender?: boolean) => void)>(this)
  unmount = unmountComponentAtNode.bind<(() => boolean)>(this)
  shadowRootCSS = shadowRootCSS.bind<((id?: string) => void)>(this)

  /**
   * Component fields
   */
  private load = loadNotifications.bind<((reload?: boolean) => Promise<void>)>(this)
  next = () => this.load(false)
  reload = () => this.load(true)
  onClick = onClick.bind(this)
  onClickAll = onClickAll.bind(this)

  /**
   * Bind `this` to match react element props
   * @returns react element props
   */
  create (): NotificationCenterProps {
    const props: NotificationCenterProps = {
      notifications: this.notifications,
      next: this.next,
      reload: this.reload,
      locales: this.locales,
      error: this.error,
      done: this.done,
      onClick: this.onClick,
      onClickAll: this.onClickAll,
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

  /**
   * webcomponents lifecycle
   */

  connectedCallback () {
    this.shadowRootCSS('micro-lc-notification-center-style')
    /**
     * There's no need of rendering when attaching the component.
     * If the component is disconnected and then re-connected a single
     * re-render is needed in order to re-apply the shadowed React component within
     */
    this.rerender(this.wasDetached)
  }

  componentWillLoad () {
    /**
     * Performs a notification refresh only on first render.
     * If the component is disconnected and re-connected this
     * step is not needed since it memory content is not erased
     */
    this.next()
  }

  disconnectedCallback () {
    return disconnectedCallback.bind<(() => void)>(this)()
  }

  render () {
    return render.bind<(() => VNode)>(this)()
  }
}
