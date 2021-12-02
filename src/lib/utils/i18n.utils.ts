import {createContext, useContext} from 'react'

export type LocalizedString = string | Record<string, string>

export type Translations = Record<'title' | 'loadingButton' | 'dateFormat' | 'errorMessage' | 'noNotification' | 'readAll' | 'reload', LocalizedString>
export type DefaultTranslations = Record<keyof Translations, string>
export type PartialTranslations = Partial<Translations>

const DEFAULT_LANG = 'en'

const I18n = createContext<{
  defaultTranslations?: DefaultTranslations
  locales?: PartialTranslations
}>({})

function useLocale () {
  const {defaultTranslations, locales} = useContext(I18n)
  const lang = navigator.language || DEFAULT_LANG

  const t = (key: keyof Translations): string => {
    if(locales && locales[key]) {
      const translation = locales[key]
      if(typeof translation === 'string') {
        return translation
      }

      const availableKeys = Object.keys(translation)
      if(availableKeys.includes(lang)) {
        return translation[lang]
      } else if (availableKeys.includes(lang.substring(0, 2))) {
        return translation[lang.substring(0, 2)]
      }
      
      return defaultTranslations[key]
    }

    return key
  }

  return {t, lang}
}

export {I18n, useLocale}
