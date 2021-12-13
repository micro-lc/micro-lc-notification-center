import React from 'react'

import {h, Host, VNode} from '@stencil/core'
import ReactDOM from 'react-dom'

import {setCssVariables} from '../utils/shadowRootCSS'
import {MicroLcNotificationCenter} from './notification-center/micro-lc-notification-center'

export interface Creatable<P = Record<string, never>> {
  wasDetached: boolean
  element: HTMLElement
  Component: React.FunctionComponent<P>
  create(): P
  rerender(conditionalRender?: boolean): void
  unmount(): boolean
}

function reactRender<P, T extends Creatable<P>> (this: T, conditionalRender = true): void {
  conditionalRender && ReactDOM.render(
    React.createElement.bind(this, this.Component, this.create())(),
    this.element
  )
}

function unmountComponentAtNode<P, T extends Creatable<P>> (this: T): boolean {
  this.wasDetached = true
  return ReactDOM.unmountComponentAtNode(this.element)
}

const MICROLC_PRIMARY_COLOR_VAR = '--microlc-primary-color'

function shadowRootCSS<P, T extends Creatable<P>> (this: T, id?: string): void {
  const microlcPrimaryColor = window.getComputedStyle(document.documentElement).getPropertyValue(MICROLC_PRIMARY_COLOR_VAR)
  const css = setCssVariables(microlcPrimaryColor)

  const style = document.createElement('style')
  style.innerText = css
  id && style.setAttribute('sty-id', id)

  this.element.shadowRoot.appendChild(style)
}

function render (this: MicroLcNotificationCenter): VNode {
  const host = h(Host, null, h('slot'))
  this.rerender()
  return host
}

function disconnectedCallback (this: MicroLcNotificationCenter): void {
  this.unmount()
}

export {render, disconnectedCallback, reactRender, unmountComponentAtNode, shadowRootCSS}
