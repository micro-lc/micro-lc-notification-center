import {translate} from '../i18n'

describe('i18n tests', () => {
  it.each([
    [{en: 'en'}, undefined, 'en'],
    [{en: 'en', it: 'it'}, 'it', 'it'],
    [{en: 'en', 'en-US': 'en-US'}, 'en-US', 'en-US'],
    [{en: 'en', it: 'it'}, 'en-US', 'en'],
    [{en: 'en'}, 'it', ''],
  ])('should return from %s with %s translation %s', (obj, lang, translation) => {
    expect(translate(obj, lang)).toStrictEqual(translation)
  })

  it('should track navigator language', () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: 'it'}})

    expect(translate({en: 'en', it: 'it'})).toStrictEqual('it')

    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })
  
  it('should track navigator language', () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: undefined}})

    expect(translate({en: 'en', it: 'it'})).toStrictEqual('en')

    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })
})