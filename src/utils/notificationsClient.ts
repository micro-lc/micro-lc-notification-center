import axios, {AxiosResponse} from 'axios'

import {MicroLcNotificationCenter} from '../components/notification-center/micro-lc-notification-center'
import {Notification} from '../lib'

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

const DEFAULT_PAGINATION_LIMIT = 10

async function getNotifications (this: MicroLcNotificationCenter, skip: number): Promise<Notification[]> {
  const {
    endpoint,
    headers,
    limit,
    skipQueryParam,
    limitQueryParam
  } = this
  const {data} = await axios.get<Notification[]>(`${endpoint}${Routes.Fetch}`, {
    headers: headers,
    params: {[skipQueryParam]: skip, [limitQueryParam]: limit},
    responseType: 'json'
  })
  return data
}

async function patchReadState (this: MicroLcNotificationCenter, _id: string, readState = true): Promise<void> {
  if (!_id) {
    throw new Error('`_id` cannot be undefined or an empty string')
  }

  const route = `${Routes.SetRead}/${_id}`
  await axios.patch<void, AxiosResponse<void>, ReadStateRequestBody>(`${this.endpoint}${route}`, {readState}, {headers: this.headers})
}

async function patchAllReadState (this: MicroLcNotificationCenter): Promise<number> {
  const route = `${Routes.SetRead}${Routes.Fetch}`
  const {data} = await axios.patch<number, AxiosResponse<number>, ReadStateRequestBody>(`${this.endpoint}${route}`, {readState: true}, {headers: this.headers})
  return data
}

async function getCounts (this: MicroLcNotificationCenter): Promise<Counters> {
  const {data} = await axios.get<Counters>(`${this.endpoint}${Routes.Count}`, {headers: this.headers})
  return data
}

export {getNotifications, patchReadState, patchAllReadState, getCounts, DEFAULT_PAGINATION_LIMIT}
