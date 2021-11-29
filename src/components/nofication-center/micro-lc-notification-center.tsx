import React from 'react'

import {h, Component, Host, Element, Prop, State} from '@stencil/core'
import ReactDOM from 'react-dom'

import {NotificationCenter, Notification, NotificationCenterProps} from '../../lib'
import {DEFAULT_PAGINATION_LIMIT, getNotifications} from '../../utils/notificationsClient'
import {MicroLcHeaders, Pagination} from './micro-lc-notification-center.types'

@Component({
  tag: 'micro-lc-notification-center',
  styleUrl: '../../../node_modules/antd/dist/antd.css',
  shadow: false
})
export class MicroLcNotificationCenter {
  @Element() element: HTMLElement

  @Prop() endpoint: string
  @Prop() headers: MicroLcHeaders = {}
  @Prop() limit = DEFAULT_PAGINATION_LIMIT
  
  @State() notifications: Notification[] = []
  @State() loading: boolean | undefined
  @State() page: Pagination = {skip: 0}

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
        reload: () => this.loadNotifications(0, true)
      }
    )
  }

  private renderToDOM(): void {
    ReactDOM.render(this.create(), this.element)
  }

  private loadNotifications(page = 0, reload = true): void {
    this.loading = true 
    const handler = getNotifications.bind(this) as (skip: number) => Promise<Notification[]>
    handler(page).then((notifications) => {
      this.notifications = reload ? notifications : [...this.notifications, ...notifications]
      this.postRetrieval(page)
    }).finally(() => {this.loading = false})
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
    if(this.endpoint && this.page.last === undefined) {
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
