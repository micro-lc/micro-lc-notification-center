import {getLink} from '../getLink'

class Anchor {
  private _href?: string
  protocol?: string
  host?: string
  get href (): string | undefined {
    return this._href
  }

  set href (s: string | undefined) {
    if (!s.match(/^https?:\/\/[^/?]+/)) {
      this._href = `http://testing.stenciljs.com${s.match(/[^/?]/) ? s : '/'.concat(s)}`
    } else {
      this._href = s
    }
    this.protocol = s.match(/^(https?)/)?.[1] ?? 'http'
    this.host = s.match(/^https?:\/\/([^/]+)/)?.[1] ?? 'testing.stenciljs.com'
  }
}

describe('url utils tests', () => {
  it.each([
    ['/link', 'http://testing.stenciljs.com/link'],
    ['https://google.com/link', 'https://google.com/link'],
    ['?_q=0', 'http://testing.stenciljs.com/?_q=0'],
    ['https://google.com?_q=0', 'https://google.com/?_q=0']
  ])('should redirect %s to given %s', (content, expected) => {
    expect(getLink(content, true).href).toStrictEqual(expected)
  })

  it.each([
    ['/link', 'http://testing.stenciljs.com/link'],
    ['https://google.com/link', 'https://google.com/link'],
    ['/?_q=0', 'http://testing.stenciljs.com/?_q=0'],
    ['https://google.com/?_q=0', 'https://google.com/?_q=0']
  ])('should redirect %s to given %s', (content, expected) => {
    const actual = window.document.createElement
    const createElement = jest.fn().mockReturnValue(new Anchor())
    Object.defineProperty(window.document, 'createElement', {writable: true, value: createElement})

    expect(getLink(content, false).href).toStrictEqual(expected)

    Object.defineProperty(window.document, 'createElement', {writable: true, value: actual})
  })
})
