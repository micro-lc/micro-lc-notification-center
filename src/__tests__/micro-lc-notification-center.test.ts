import {elementUpdated, fixture, html} from '@open-wc/testing-helpers'
import type {MicroLcNotificationCenter} from '../micro-lc-notification-center'

import '../micro-lc-notification-center'

jest.mock('../utils/engine', () => ({
  __esModule: true,
  reactRender: jest.fn(),
  unmount: jest.fn()
}))

// UTILS

type WaitForOptions = {
  timeout: number
}

async function wait (
  page: MicroLcNotificationCenter,
  callback?: () => any,
  opts: WaitForOptions = {timeout: 3000}
): Promise<MicroLcNotificationCenter> {
  let reason: any
  let outsideResolve: (value: any) => void
  let outsideReject: (reason?: any) => void
  const promise = new Promise<any>((resolve, reject) => {
    outsideResolve = resolve
    outsideReject = reject
  })
  const interval = setInterval(() => {
    try {
      outsideResolve(callback?.())
    } catch (err) {
      reason = err
    }
  }, 100)
  const timeout = setTimeout(() => {
    clearInterval(interval)
    outsideReject(reason)
  }, opts.timeout)

  return await promise
    .then(() => elementUpdated<MicroLcNotificationCenter>(page))
    .finally(() => {
      clearInterval(interval)
      clearTimeout(timeout)
    })
}


const of = global.fetch

describe('', () => {
  const fetch = jest.fn()
  beforeAll(() => {
    Object.defineProperty(global, 'fetch', {writable: true, value: fetch})
  })
  afterAll(() => {
    Object.defineProperty(global, 'fetch', {writable: true, value: of})
  })
  
  it('should render and on `firstUpdate` fetch notifications', async () => {
    fetch
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => ([])})
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => ({count: 0, unread: 0})})
    const el = await fixture<MicroLcNotificationCenter>(html`<micro-lc-notification-center></micro-lc-notification-center>`)
    expect(el.create().locales).toEqual({
      title: 'Notifications',
      loadingButton: 'Load More',
      dateFormat: 'YYYY-MM-DD',
      noNotification: 'No notification to show',
      errorMessage: 'An error occurred, try again',
      readAll: 'Mark all as read',
      reload: 'Reload',
      backOnTop: 'Back on top',
    })

    await wait(el, () => {
      expect(fetch).toBeCalledTimes(2)
    })
    expect(el.create().notifications).toEqual([])
    expect(el.create().count).toEqual(0)
    expect(el.create().unread).toEqual(0)
    expect(el.create().error).toBe(false)
  })
  
  it('should render and on `firstUpdate` after failed fetch', async () => {
    fetch
      .mockRejectedValueOnce({ok: false, status: 404})
      .mockRejectedValueOnce({ok: false, status: 404})
    const el = await fixture<MicroLcNotificationCenter>(html`<micro-lc-notification-center></micro-lc-notification-center>`)

    await wait(el, () => {
      expect(fetch).toBeCalledTimes(2)
    })
    expect(el.create().notifications).toEqual([]) // default value
    expect(el.create().count).toBeUndefined()
    expect(el.create().unread).toBeUndefined()
    expect(el.create().error).toBe(true)
  })
  
  it('should render and reload', async () => {
    fetch
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => ([])})
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => ({count: 0, unread: 0})})
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => ([{_id: '1', creatorId: '1', createdAt: new Date().toISOString(), title: 'title'}])})
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => ({count: 1, unread: 1})})
    const el = await fixture<MicroLcNotificationCenter>(html`<micro-lc-notification-center></micro-lc-notification-center>`)

    await wait(el, () => {
      expect(fetch).toBeCalledTimes(2)
    })
    expect(el.create().notifications).toEqual([])
    expect(el.create().count).toEqual(0)
    expect(el.create().unread).toEqual(0)
    
    await el.create().reload()

    expect(el.create().notifications).toHaveLength(1)
    expect(el.create().count).toEqual(1)
    expect(el.create().unread).toEqual(1)
  })
  
  it('should render and then click on notifications triggering push events', async () => {
    const {history} = window
    Object.defineProperty(window, 'history', {writable: true, value: {state: {}, pushState: jest.fn()}})
    fetch
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => ([
        {
          _id: '1', creatorId: '1', createdAt: new Date().toISOString(), title: 'title',
          content: 'content',
          onClickCallback: {content: {url: 'https://google.com'}}
        },
        {
          _id: '2', creatorId: '2', createdAt: new Date().toISOString(), title: 'title',
          content: 'content',
          onClickCallback: {content: 'https://amazon.com'}
        }
      ])})
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => ({count: 2, unread: 2})})
      .mockResolvedValueOnce({ok: true, status: 204})
      .mockResolvedValueOnce({ok: true, status: 204})

    const el = await fixture<MicroLcNotificationCenter>(html`
      <micro-lc-notification-center
        .allowExternalHrefs=${true}
        .clickStrategy=${'push'}
      ></micro-lc-notification-center>
    `)

    await wait(el, () => {
      expect(fetch).toBeCalledTimes(2)
    })

    let not = el.create().notifications[0]
    await el.create().onClick(not, 0)
    
    expect(el.create().count).toEqual(2)
    expect(el.create().unread).toEqual(1)
    expect(window.history.pushState).toBeCalledWith({}, '', 'https://google.com')
    
    not = el.create().notifications[1]
    await el.create().onClick(not, 1)
    
    expect(el.create().count).toEqual(2)
    expect(el.create().unread).toEqual(0)
    expect(window.history.pushState).toBeCalledWith({}, '', 'https://amazon.com')
  
    Object.defineProperty(window, 'history', {writable: true, value: history})
  })

  it('should render i18n locales', async () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: 'it'}})
    fetch
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => ([])})
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => ({count: 0, unread: 0})})

    const locales = {
      title: {it: 'a'},
      loadingButton: {it: 'a'},
      dateFormat: {it: 'a'},
      noNotification: {it: 'a'},
      errorMessage: {it: 'a'},
      readAll: {it: 'a'},
      reload: {it: 'a'},
      backOnTop: {it: 'a'},
    }
    const el = await fixture<MicroLcNotificationCenter>(html`
      <micro-lc-notification-center
        .locales=${locales}
      ></micro-lc-notification-center>
    `)
    
    await wait(el, () => {
      expect(fetch).toBeCalledTimes(2)
    })

    expect(el.create().locales).toEqual({
      title: 'a',
      loadingButton: 'a',
      dateFormat: 'a',
      noNotification: 'a',
      errorMessage: 'a',
      readAll: 'a',
      reload: 'a',
      backOnTop: 'a',
    })
    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })
  
  it('should localize notifications', async () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: 'it'}})
    fetch
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => ([{title: {en: 'title', it: 'titolo'}, content: {en: 'content', it: 'contenuto'}}])})
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => ({count: 1, unread: 1})})

    const el = await fixture<MicroLcNotificationCenter>(html`<micro-lc-notification-center></micro-lc-notification-center>`)
    
    await wait(el, () => {
      expect(fetch).toBeCalledTimes(2)
    })

    expect(el.create().notifications[0]).toEqual({title: 'titolo', content: 'contenuto'})
    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })
  
  it('should be ok on faulty notifications', async () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: 'it'}})
    fetch
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => ([{}])})
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => ({count: 1, unread: 1})})

    const el = await fixture<MicroLcNotificationCenter>(html`<micro-lc-notification-center></micro-lc-notification-center>`)
    
    await wait(el, () => {
      expect(fetch).toBeCalledTimes(2)
    })

    expect(el.create().notifications[0]).toEqual({title: ''})
    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })
  
  it('should patch all notifications', async () => {
    const {navigator} = window
    Object.defineProperty(window, 'navigator', {writable: true, value: {language: 'it'}})
    fetch
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => ([{}])})
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => ({count: 0, unread: 1})})
      .mockResolvedValueOnce({ok: true, status: 200, json: async () => 0})

    const el = await fixture<MicroLcNotificationCenter>(html`<micro-lc-notification-center></micro-lc-notification-center>`)
    
    await wait(el, () => {
      expect(fetch).toBeCalledTimes(2)
    })

    el.create().onClickAll()
    
    await wait(el, () => {
      expect(fetch).toBeCalledTimes(3)
    })

    expect(el.create().unread).toStrictEqual(0)
    Object.defineProperty(window, 'navigator', {writable: true, value: navigator})
  })
})

describe('lifecycle', () => {
  it('should destroy and re-connect', async () => {
    const el = await fixture(html`<micro-lc-notification-center></micro-lc-notification-center>`)

    const {parentElement: p} = el
    el.remove()

    p.appendChild(el)
    expect(document.body.innerHTML).toContain('<micro-lc-notification-center></micro-lc-notification-center>')
  })
})
