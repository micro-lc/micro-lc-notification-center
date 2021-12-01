import React from 'react'

import ReactDOM from 'react-dom'

import {setCssVariables} from '../utils/shadowRootCSS'

export interface Creatable<P = Record<string, never>> {
  wasDetached: boolean
  element: HTMLElement
  Component: React.FunctionComponent<P>
  create(): P
  rerender(conditionalRender?: boolean): void
  unmount(): boolean
}

function reactRender<P, T extends Creatable<P>>(this: T, conditionalRender = true): void {
  conditionalRender && ReactDOM.render(
    React.createElement.bind(this, this.Component, this.create())(), 
    this.element
  )
}

function unmountComponentAtNode<P, T extends Creatable<P>>(this: T): boolean {
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

export {reactRender, unmountComponentAtNode, shadowRootCSS}
