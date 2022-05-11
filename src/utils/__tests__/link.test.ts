import type {MicroLcNotificationCenter} from '../../micro-lc-notification-center'
import {getLink} from '../link'

// jest.createMockFromModule('@braintree/sanitize-url')

describe('', () => {
  it('should trim absolute paths', () => {
    const shadowRoot = {
      ownerDocument: {
        createElement: jest.fn().mockReturnValue({
          protocol: 'http:',
          host: 'localhost'
        })
      }
    }

    const parser = getLink.call({shadowRoot} as unknown as MicroLcNotificationCenter, 'http://localhost/content')
    expect(parser).toEqual({
      host: 'localhost',
      href: '/content',
      protocol: 'http:',
    })
  })
  
  it('should not match anything', () => {
    const shadowRoot = {
      ownerDocument: {
        createElement: jest.fn().mockReturnValue({
          protocol: 'http:',
          host: 'localhost'
        })
      }
    }

    const parser = getLink.call({shadowRoot} as unknown as MicroLcNotificationCenter, '/content')
    expect(parser).toEqual({
      host: 'localhost',
      href: '/content',
      protocol: 'http:',
    })
  })
  
  it('should not trim absolute paths', () => {
    const shadowRoot = {
      ownerDocument: {
        createElement: jest.fn().mockReturnValue({
          protocol: 'https:',
          host: 'google.com'
        })
      }
    }

    const parser = getLink.call({shadowRoot} as unknown as MicroLcNotificationCenter, 'https://google.com/content', true)
    expect(parser).toEqual({
      host: 'google.com',
      href: 'https://google.com/content',
      protocol: 'https:',
    })
  })
})