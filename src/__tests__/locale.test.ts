import dayjs from 'dayjs'
import {loadLocale} from '../locale'

jest.mock('dayjs', () => ({
  __esModule: true,
  default: {locale: jest.fn()}
}))

describe('locale tests', () => {
  it('should load the proper locale', async () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: 'it'}})

    await loadLocale()
    expect(dayjs.locale).toBeCalledWith('it')

    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })
})
