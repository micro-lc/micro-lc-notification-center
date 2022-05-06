import {createContext, useContext} from 'react'

export type LocalizedString = string | Record<string, string>

export type LanguageKeys =
  'title' |
  'loadingButton' |
  'dateFormat' |
  'errorMessage' |
  'noNotification' |
  'readAll' |
  'reload' |
  'backOnTop'
export type Translations = Record<LanguageKeys, LocalizedString>
export type DefaultTranslations = Record<keyof Translations, string>
export type PartialTranslations = Partial<Translations>

const DEFAULT_LANG = 'en'

function translate (options: Record<string, string>, lang: string = navigator.language || DEFAULT_LANG): string {
  if (options[lang]) {
    return options[lang]
  }

  const availableKeys = Object.keys(options)
  if (availableKeys.includes(lang.substring(0, 2))) {
    return options[lang.substring(0, 2)]
  }

  return options.toString()
}

const I18n = createContext<{
  defaultTranslations?: DefaultTranslations
  locales?: PartialTranslations
}>({})

function useLocale () {
  const {defaultTranslations, locales} = useContext(I18n)
  const lang = navigator.language || DEFAULT_LANG

  const t = (key: keyof Translations): string => {
    if (locales && locales[key]) {
      const translation = locales[key]
      if (typeof translation === 'string') {
        return translation
      }

      const availableKeys = Object.keys(translation)
      if (availableKeys.includes(lang)) {
        return translation[lang]
      } else if (availableKeys.includes(lang.substring(0, 2))) {
        return translation[lang.substring(0, 2)]
      }
    }

    return defaultTranslations?.[key]
  }

  return {t, lang}
}
export {I18n, useLocale, translate}
