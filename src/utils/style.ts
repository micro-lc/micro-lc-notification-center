import {generate} from '@ant-design/colors'
import type {LitElement} from 'lit'

const MICRO_LC_NOTIFICATION_CENTER_FONT_FAMILY = '--micro-lc-notification-center-font-family'
const MICRO_LC_PRIMARY_COLOR_VAR = '--microlc-primary-color'
const ANT_VAR_PREFIX = '--ant'

const DEFAULT_FONT_FAMILY = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
  'Helvetica Neue', Arial,
  'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
  'Noto Color Emoji'
`

/**
 * return a `:host` css content to be set as root/shadow-root css style
 * @param primary hex color to be set as primary
 * @returns a css style root object
 */
const setCssVariables = (primary: string) => {
  const palette = generate(primary)
  const prim = `${ANT_VAR_PREFIX}-primary-color: ${primary};`
  const colors = palette.slice(0, 7).map((color, index) =>
    `${ANT_VAR_PREFIX}-primary-${index + 1}: ${color};`
  )
  const error = `${ANT_VAR_PREFIX}-error-color: #f5222d;`
  const hover = `${ANT_VAR_PREFIX}-primary-color-hover: ${palette[4]};`
  const active = `${ANT_VAR_PREFIX}-primary-color-active: ${palette[6]};`
  const outline = `${ANT_VAR_PREFIX}-primary-color-outline: ${primary}33;`
      
  const fontFamily= `font-family: var(${MICRO_LC_NOTIFICATION_CENTER_FONT_FAMILY},${DEFAULT_FONT_FAMILY.replace(/ /g, '')});`

  const cssContent = [prim, ...colors, error, hover, active, outline, fontFamily].filter(Boolean).join('')
  return `:host{${cssContent}}`
}

export function shadowRootCSS(doc?: Document): string {
  const microlcPrimaryColor = window.getComputedStyle((doc ?? document).documentElement).getPropertyValue(MICRO_LC_PRIMARY_COLOR_VAR)
  return setCssVariables(microlcPrimaryColor)
}

export function decorateRoot<T extends LitElement>(this: T, styleSheets: string | string[]): void {
  const {
    shadowRoot
  } = this

  let s = styleSheets as string[]
  if(!Array.isArray(styleSheets)) {
    s = [styleSheets as string]
  }

  if(shadowRoot && 'adoptedStyleSheets' in shadowRoot.ownerDocument && s.length !== 0) {
    shadowRoot.adoptedStyleSheets = s.map((sheet) => {
      const cssStyleSheet = new CSSStyleSheet()
      cssStyleSheet.replaceSync(sheet)
      return cssStyleSheet
    })
  }
}