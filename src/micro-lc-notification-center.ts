import {html, LitElement, PropertyValueMap} from 'lit'
import {customElement, property, query, state} from 'lit/decorators.js'
import {LitCreatable, reactRender, unmount} from './utils/engine'
import style from './micro-lc-notification-center.less'

import {
  NotificationCenter, 
  Notification, 
  NotificationCenterProps
} from './react-components'
import {DefaultTranslations, LocalizedString, PartialTranslations, translateLocale} from './utils/i18n'
import {DEFAULT_PAGINATION_LIMIT, HttpClient} from './utils/client'
import {createProps, defaultTranslations, loadNotifications} from './micro-lc-notification-center.lib'
import {createClient} from './utils/client'
import type {FunctionComponent} from 'react'
import {decorateRoot, shadowRootCSS} from './utils/style'
import Subscription from './utils/Subscription'

const DEFAULT_MICRO_LC_NOTIFICATION_ENDPOINT = '/api/v1/micro-lc-notification-center'

type Pagination = {
  skip: number
  last?: number
}

export type MicroLcHeaders = Record<string, string>
export type ClickStrategies = 'default' | 'href' | 'replace' | 'push'
export type CallbackHref = {
  content: string | Record<string, any>
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
export type ResourceFetchingMode = 'default' | 'none' | 'polling' | 'long-polling' | 'websocket'

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
  @property({attribute: false}) 
  get locales(): PartialTranslations | DefaultTranslations {
    return this._locales
  }
  
  set locales(pt: PartialTranslations | DefaultTranslations) {
    this._locales = translateLocale<DefaultTranslations>(pt)
  }

  /**
   * `clickStrategy` (optional) is an enum taking values
   * 'default' | 'href' | 'replace' | 'push' which correspond to
   * what happens when a notification is clicked. Default and href do create
   * an `anchor` and click it. `replace` triggers the location replace
   * while `push` pushes onto window.history stack
   */
  @property({attribute: 'click-strategy'}) clickStrategy: ClickStrategies = 'default'
  
  /**
   * `limitQueryParam (optional)
   * defaults to 'limit' and it's the query parameter which controls
   * notification pagination page size while fetching data
   */
  @property({attribute: 'limit-query-param'}) limitQueryParam = 'limit'

  /**
   * `limitQueryParam (optional)
   * defaults to 'limit' and it's the query parameter which controls
   * notification pagination skip while fetching data
   */
  @property({attribute: 'skip-query-param'}) skipQueryParam = 'skip'

  /**
   * `pushStateKey (optional)
   * defaults to 'micro-lc-notification-center' and it's the key used
   * to scope the content callback context in window.history.state when clickStrategy
   * is 'push'. Otherwise it is neglected
   */
  @property({attribute: 'push-state-key'}) pushStateKey = 'micro-lc-notification-center'

  /**
   * `allowExternalHrefs (optional)
   * defaults to false. When true, notification links can browse to external web pages
   * and href are not checked to ensure they are relative to self-website
   */
  @property({type: Boolean, attribute: 'allow-external-hrefs'}) allowExternalHrefs = false

  // TODO
  @property() mode: ResourceFetchingMode = 'default'

  @state() notifications: Notification[] = []
  @state() loading?: boolean
  @state() page: Pagination = {skip: 0}
  @state() error = false
  @state() done = false
  @state() count?: number
  @state() unread?: number
  @state() _locales = defaultTranslations

  @query('#root-div') rootDiv!: HTMLDivElement
  
  private _shouldRenderWhenConnected = false
  protected subscription = new Subscription()
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
  connectedCallback(): void {
    if (this._shouldRenderWhenConnected) {
      reactRender.call(this, this.rootDiv)
      this._shouldRenderWhenConnected = false
    }
    super.connectedCallback()
    
    if(this.subscription.closed) {
      this.subscription = new Subscription()
    }
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    decorateRoot.call(this, [
      shadowRootCSS(this.shadowRoot?.ownerDocument),
      style
    ])

    super.firstUpdated(_changedProperties)
    const httpClient = createClient.call(this)
    loadNotifications.call(this, httpClient, false)

    if(!['default', 'none'].includes(this.mode)) {
      // TODO
    }
    this.httpClient = httpClient
  }

  protected updated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    super.update(_changedProperties)
    reactRender.call(this, this.rootDiv)
  }

  protected render(): unknown {
    return html`<div id="root-div"></div>`
  }
  
  disconnectedCallback(): void {
    unmount.call(this)
    this._shouldRenderWhenConnected = true
    this.subscription.unsubscribe()
    super.disconnectedCallback()
  }
}
