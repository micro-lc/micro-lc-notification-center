import {html, LitElement, PropertyValueMap} from 'lit'
import {customElement, property, query, state} from 'lit/decorators.js'
import {LitCreatable, reactRender, unmount} from './utils/engine'
import style from './micro-lc-notification-center.less'

import {
  NotificationCenter, 
  Notification, 
  NotificationCenterProps
} from './react-components'
import type {LocalizedString, PartialTranslations} from './utils/i18n'
import {DEFAULT_PAGINATION_LIMIT, HttpClient} from './utils/client'
import {createProps, loadNotifications} from './micro-lc-notification-center.lib'
import {createClient} from './utils/client'
import type {FunctionComponent} from 'react'
import {decorateRoot, shadowRootCSS} from './utils/style'

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
@customElement('micro-lc-notification-center')
export class MicroLcNotificationCenter extends LitElement implements LitCreatable<NotificationCenterProps> {
  /**
   * @description [micro-lc-element-composer](https://microlc.io/documentation/docs/micro-lc/core_plugins#microlc-element-composer)
   * default prop representing the authenticated user. It's context can be configured via micro-lc backend config files.
   * @see {@link https://microlc.io/documentation/docs/micro-lc/authentication}
   */
  @property({attribute: false}) currentUser: Record<string, unknown> = {}

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
  @property({type: String}) endpoint = DEFAULT_MICRO_LC_NOTIFICATION_ENDPOINT

  /**
   * `limit` (optional) controls pagination limit
   * while fetching notifications. It is also an HTML
   * attribute.
   */
  @property({type: Number}) limit = DEFAULT_PAGINATION_LIMIT

  /**
   * `headers` (optional) is a key-value list of
   * http headers to attach to the http client that
   * fetches notifications
   */
  @property({attribute: false}) headers: MicroLcHeaders = {}

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
  @property({attribute: false}) locales: PartialTranslations = {}

  /**
   * `clickStrategy` (optional) is an enum taking values
   * 'default' | 'href' | 'replace' | 'push' which correspond to
   * what happens when a notification is clicked. Default and href do create
   * an `anchor` and click it. `replace` triggers the location replace
   * while `push` pushes onto window.history stack
   */
  @property({type: String, attribute: 'click-strategy'}) clickStrategy: ClickStrategies = 'default'

  @state() notifications: Notification[] = []
  @state() loading?: boolean
  @state() page: Pagination = {skip: 0}
  @state() error = false
  @state() done = false
  @state() count?: number
  @state() unread?: number

  @query('#root-div') rootDiv!: HTMLDivElement
  
  private _shouldRenderWhenConnected = false
  protected httpClient!: HttpClient

  /**
   * React engine utils
   */
  create = createProps.bind(this)

  /**
   * Component fields
   */
  Component: FunctionComponent<NotificationCenterProps> = NotificationCenter

  /**
   * webcomponents lifecycle
   */
  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    super.firstUpdated(_changedProperties)
    const httpClient = createClient.call(this)
    loadNotifications.call(this, httpClient, false)

    this.httpClient = httpClient
    
    decorateRoot.call(this, [
      shadowRootCSS(this.shadowRoot?.ownerDocument),
      style
    ])
  }

  protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    super.update(_changedProperties)
    reactRender.call(this, this.rootDiv)
  }

  protected render(): unknown {
    return html`<div id="root-div"></div>`
  }
  
  connectedCallback(): void {
    if (this._shouldRenderWhenConnected) {
      reactRender.call(this, this.rootDiv)
      this._shouldRenderWhenConnected = false
    }
    super.connectedCallback()
  }

  disconnectedCallback(): void {
    unmount.call(this)
    this._shouldRenderWhenConnected = true
    super.disconnectedCallback()
  }
}