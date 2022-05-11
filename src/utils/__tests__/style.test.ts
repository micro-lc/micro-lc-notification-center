import {shadowRootCSS} from '../style'

describe('compute antd css variables', () => {
  const style = {setAttribute: jest.fn()}
  Object.defineProperty(window, 'getComputedStyle', {
    writable: true,
    configurable: true,
    value: () => ({
      getPropertyValue: () => '--microlc-primary-color'
    })
  })
  Object.defineProperty(document, 'createElement', {
    writable: true,
    value: () => style
  })

  it('should set a new stylesheet onto shadow-root containing antd dynamic theme override', () => {
    const style = shadowRootCSS()

    expect(style).toEqual(':host{\
--ant-primary-color: --microlc-primary-color;\
--ant-primary-1: #404040;--ant-primary-2: #333333;\
--ant-primary-3: #262626;--ant-primary-4: #1a1a1a;\
--ant-primary-5: #0d0d0d;--ant-primary-6: #000000;\
--ant-primary-7: #000000;--ant-error-color: #f5222d;\
--ant-primary-color-hover: #0d0d0d;\
--ant-primary-color-active: #000000;\
--ant-primary-color-outline: --microlc-primary-color33;\
font-family: var(--micro-lc-notification-center-font-family,\
-apple-system,BlinkMacSystemFont,\'SegoeUI\',Roboto,\
\'HelveticaNeue\',Arial,\'NotoSans\',sans-serif,\'AppleColorEmoji\',\
\'SegoeUIEmoji\',\'SegoeUISymbol\',\'NotoColorEmoji\');}'
    )
  })
})
