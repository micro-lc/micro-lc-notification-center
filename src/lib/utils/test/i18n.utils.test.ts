import {renderHook} from '@testing-library/react-hooks'

import {defaultTranslations} from '../../notification-center/NotificationCenter'
import {I18n, useLocale} from '../i18n.utils'

const init = (lang = 'en') => {
  Object.defineProperty(window.navigator, 'language', {writable: true, value: lang})
}

describe('i18n tests', () => {
  it('should obtain locales from given i18n context', () => {
    init()
    const {result: {current: {t, lang}}} = renderHook(() => useLocale())
    expect(lang).toBe('en')
    expect(t('title')).toBeUndefined()
  })

  it('should obtain locales from given i18n context on given 2-letters lang', () => {
    const initLang = 'it'
    init(initLang)
    const {result: {current: {t, lang}}} = renderHook(() => useLocale(), {
      wrapper: I18n.Provider,
      initialProps: {
        value: {
          defaultTranslations,
          locales: {
            title: {
              it: 'Notifiche'
            },
            loadingButton: 'Load'
          }
        }
      }
    })
    expect(lang).toBe(initLang)
    expect(t('title')).toStrictEqual('Notifiche')
    expect(t('loadingButton')).toStrictEqual('Load')
  })

  it('should obtain locales from given i18n context on given 4-letters lang', () => {
    const initLang = 'it-IT'
    init(initLang)
    const {result: {current: {t}}} = renderHook(() => useLocale(), {
      wrapper: I18n.Provider,
      initialProps: {
        value: {
          defaultTranslations,
          locales: {
            title: {
              it: 'Notifiche'
            }
          }
        }
      }
    })
    expect(t('title')).toStrictEqual('Notifiche')
  })

  it('should default from given i18n context on missing 2-letters lang', () => {
    const initLang = 'de'
    init(initLang)
    const {result: {current: {t}}} = renderHook(() => useLocale(), {
      wrapper: I18n.Provider,
      initialProps: {
        value: {
          defaultTranslations,
          locales: {
            title: {
              it: 'Notifiche'
            }
          }
        }
      }
    })
    expect(t('title')).toStrictEqual('Notifications')
  })

  it('should default lang on undefined browser context', () => {
    Object.defineProperty(window.navigator, 'language', {writable: true, value: undefined})

    const {result: {current: {t}}} = renderHook(() => useLocale(), {
      wrapper: I18n.Provider,
      initialProps: {
        value: {
          defaultTranslations,
          locales: {
            title: {
              en: 'given string',
              it: 'Notifiche'
            }
          }
        }
      }
    })
    expect(t('title')).toStrictEqual('given string')
  })
})
