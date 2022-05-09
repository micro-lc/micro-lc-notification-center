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

export function createClient (this: MicroLcNotificationCenter) {
  return {
    getNotifications: async (skip: number, lang?: string): Promise<Notification[]> => {
      const url = new URL(`${this.endpoint}${Routes.Fetch}`)
      url.searchParams.set('skip', `${skip}`)
      url.searchParams.set('limit', `${this.limit}`)
      lang && url.searchParams.set('lang', lang)
      
      return fetch(url.href, {method: 'GET', headers: {...this.headers}})
        .then((res) => responseHandler(res) as Promise<Notification[]>)
    },
    getCounts: async (): Promise<Counters> => {
      return fetch(`${this.endpoint}${Routes.Count}`, {method: 'GET', headers: this.headers})
        .then((res) => responseHandler(res) as Promise<Counters>)
    },
    patchReadState: async (_id: string, readState = true): Promise<void> => {
      if (!_id) {
        throw new Error('`_id` cannot be undefined or an empty string')
      }
      return fetch(`${this.endpoint}${Routes.SetRead}/${_id}`, {
        method: 'PATCH',
        body: JSON.stringify({readState}),
        headers: {'Content-Type': 'application/json', ...this.headers}
      }).then((res) => responseHandler(res) as Promise<void>)
    },
    patchAllReadState: async (): Promise<number | void> => {
      return fetch(`${this.endpoint}${Routes.SetRead}${Routes.Fetch}`, {
        method: 'PATCH',
        body: JSON.stringify({readState: true}),
        headers: {'Content-Type': 'application/json', ...this.headers}
      }).then((res) => responseHandler(res) as Promise<number | void>)
    }
  }
}
