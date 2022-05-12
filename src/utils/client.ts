import {MicroLcNotificationCenter} from '../micro-lc-notification-center'
import type {Notification} from '../react-components/NotificationCenter'

export type ReadStateRequestBody = {
  readState: boolean
}

export type Counters = {
  count: number
  unread: number
}

export enum Routes {
  Fetch = '/own',
  SetRead = '/read-state',
  Count = '/own/count'
}

export type HttpClient = {
  getNotifications(skip: number, lang?: string): Promise<Notification[]>
  getCounts(): Promise<Counters>
  patchReadState(_id: string, readState?: boolean): Promise<void>
  patchAllReadState(): Promise<number | void>
}

export const DEFAULT_PAGINATION_LIMIT = 10

function responseHandler<T = Record<string, any>>(res: Response): Promise<T | void | string> {
  if(res.ok) {
    if(res.status === 204) {
      return Promise.resolve()
    }

    try {
      return res.json() as Promise<T>
    } catch {
      return res.text() as Promise<string>
    }
  } 
  
  return Promise.reject(res)
}

function ensureSlash(s: string): string {
  return s.charAt(0) === '/' ? s : '/' + s
}

function resolveEndpoint(this: MicroLcNotificationCenter, subpath: string, searchParams: Record<string, string> = {}): string {
  const {
    endpoint
  } = this

  // check whether endpoint is relative or absolute
  let e = endpoint
  if(!endpoint.match(/^(?:[a-z]+:)?\/\//i)) {
    e = `${window.location.origin}${ensureSlash(endpoint)}`
  }

  // check trailing slash
  const base = e.replace(/\/$/, '')
  const spath = ensureSlash(subpath)
  
  // build URL
  const url = new URL(`${base}${spath}`)
  Object.entries(searchParams).forEach(([k, v]) => {
    url.searchParams.set(k, v)
  })

  return url.href
}

export function createClient (this: MicroLcNotificationCenter) {
  return {
    getNotifications: async (skip: number, lang?: string): Promise<Notification[]> => {
      const {
        headers,
        limit,
        skipQueryParam,
        limitQueryParam
      } = this

      const url = resolveEndpoint.call(this, `${Routes.Fetch}`, {[skipQueryParam]: `${skip}`, [limitQueryParam]: `${limit}`, lang})
      return await fetch(url, {method: 'GET', headers: {...headers}})
        .then((res) => responseHandler(res) as Promise<Notification[]>)
    },
    getCounts: async (): Promise<Counters> => {
      const url = resolveEndpoint.call(this, `${Routes.Count}`)
      return await fetch(url, {method: 'GET', headers: this.headers})
        .then((res) => responseHandler(res) as Promise<Counters>)
    },
    patchReadState: async (_id: string, readState = true): Promise<void> => {
      if (!_id) {
        throw new Error('`_id` cannot be undefined or an empty string')
      }
      const url = resolveEndpoint.call(this, `${Routes.SetRead}/${_id}`)
      return await fetch(url, {
        method: 'PATCH',
        body: JSON.stringify({readState}),
        headers: {'Content-Type': 'application/json', ...this.headers}
      }).then((res) => responseHandler(res) as Promise<void>)
    },
    patchAllReadState: async (): Promise<number | void> => {
      const url = resolveEndpoint.call(this, `${Routes.SetRead}${Routes.Fetch}`)
      return await fetch(url, {
        method: 'PATCH',
        body: JSON.stringify({readState: true}),
        headers: {'Content-Type': 'application/json', ...this.headers}
      }).then((res) => responseHandler(res) as Promise<number | void>)
    }
  }
}
