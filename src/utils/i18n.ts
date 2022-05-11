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

export function translate (options: Record<string, string>, lang: string = window.navigator.language || DEFAULT_LANG): string {
  if (options[lang]) {
    return options[lang]
  }

  const availableKeys = Object.keys(options)
  if (availableKeys.includes(lang.substring(0, 2))) {
    return options[lang.substring(0, 2)]
  }

  return ''
}

export function translateLocale<T = any>(input: PartialTranslations): T {
  const lang = window.navigator.language || DEFAULT_LANG
  return Object.entries(input).reduce((tr, [k, s]) => {
    if(typeof s === 'string') {
      tr[k] = s
    } else {
      tr[k] = translate(s, lang)
    }
    return tr
  }, {} as Record<string, string>) as unknown as T
}
