import '@testing-library/jest-dom'
import 'construct-style-sheets-polyfill'

Object.defineProperty(global, 'console', {writable: true, value: {...console, error: jest.fn()}})

const {CSSStyleSheet} = global
class EnhancedCSSStyleSheet extends CSSStyleSheet {
  insertRule (_: string, index?: number): number {
    return index ?? 0
  }
}
Object.defineProperty(global, 'CSSStyleSheet', {writable: true, value: EnhancedCSSStyleSheet})
