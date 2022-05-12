import type {MicroLcNotificationCenter} from '../../micro-lc-notification-center'
import {createClient} from '../client'

const of = global.fetch

describe('', () => {
  const fetch = jest.fn()
  beforeAll(() => {
    Object.defineProperty(global, 'fetch', {writable: true, value: fetch})
  })
  afterAll(() => {
    Object.defineProperty(global, 'fetch', {value: of})
  })
  
  it('should retrieve notifications', async () => {
    const center = {
      endpoint: '/',
      headers: {},
      limit: 10,
      skipQueryParams: 'skip',
      limitQueryParams: 'limit'
    }
    
    fetch.mockResolvedValueOnce({ok: true, status: 200, json: async () => ([])})
    const {getNotifications} = createClient.call(center as unknown as MicroLcNotificationCenter)

    const n = await getNotifications(0)
    expect(fetch).toBeCalledWith(expect.stringMatching(/\/own\?.*$/), {method: 'GET', headers: {}})
    expect(n).toEqual([])
  })
  
  it('should ensure endpoint starts with a slash', async () => {
    const center = {
      endpoint: '',
      headers: {},
      limit: 10,
      skipQueryParams: 'skip',
      limitQueryParams: 'limit'
    }
    
    fetch.mockResolvedValueOnce({ok: true, status: 200, json: async () => ([])})
    const {getNotifications} = createClient.call(center as unknown as MicroLcNotificationCenter)

    const n = await getNotifications(0)
    expect(fetch).toBeCalledWith(expect.stringMatching(/\/own\?.*$/), {method: 'GET', headers: {}})
    expect(n).toEqual([])
  })
  
  it('should retrieve count', async () => {
    const center = {
      endpoint: '/',
      headers: {},
      limit: 10,
      skipQueryParam: 'skip',
      limitQueryParam: 'limit'
    }
    
    fetch.mockResolvedValueOnce({ok: true, status: 200, json: async () => ({count: 0, unread: 0})})
    const {getCounts} = createClient.call(center as unknown as MicroLcNotificationCenter)

    const n = await getCounts()
    expect(fetch).toBeCalledWith(expect.stringMatching(/\/own\/count$/), {method: 'GET', headers: {}})
    expect(n).toEqual({count: 0, unread: 0})
  })
  
  it('should patch read state of a notification', async () => {
    const center = {
      endpoint: '/',
      headers: {},
      limit: 10,
      skipQueryParam: 'skip',
      limitQueryParam: 'limit'
    }
    
    fetch.mockResolvedValueOnce({ok: true, status: 204})
    const {patchReadState} = createClient.call(center as unknown as MicroLcNotificationCenter)

    const n = await patchReadState('id')
    expect(fetch).toBeCalledWith(expect.stringMatching(/\/read-state\/id$/), {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: '{"readState":true}'})
    expect(n).toBeUndefined()
  })
  
  it('should throw on patch read state without an id', async () => {
    const center = {
      endpoint: '/',
      headers: {},
      limit: 10,
      skipQueryParam: 'skip',
      limitQueryParam: 'limit'
    }
    
    const {patchReadState} = createClient.call(center as unknown as MicroLcNotificationCenter)

    expect(() => patchReadState('')).rejects.toThrow()
  })
  
  it('should patch all read states', async () => {
    const center = {
      endpoint: '/',
      headers: {},
      limit: 10,
      skipQueryParam: 'skip',
      limitQueryParam: 'limit'
    }
    
    fetch.mockResolvedValueOnce({ok: true, status: 200, json: async () => 0})
    const {patchAllReadState} = createClient.call(center as unknown as MicroLcNotificationCenter)

    const n = await patchAllReadState()
    expect(fetch).toBeCalledWith(expect.stringMatching(/\/read-state\/own$/), {method: 'PATCH', headers: {'Content-Type': 'application/json'}, body: '{"readState":true}'})
    expect(n).toEqual(0)
  })
})