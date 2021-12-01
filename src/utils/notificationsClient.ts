import axios, {AxiosResponse} from 'axios'

import {MicroLcNotificationCenter} from '../components/nofication-center/micro-lc-notification-center'

export type ReadStateRequestBody = {
  readState: boolean
}

export enum Routes {
  Fetch = '/own',
  SetRead = '/read-state',
}

const DEFAULT_PAGINATION_LIMIT = 10

async function getNotifications(this: MicroLcNotificationCenter, skip: number): Promise<Notification[]> {
  const {data} = await axios.get<Notification[]>(`${this.endpoint}${Routes.Fetch}`, {
    headers: this.headers,
    params: {skip, limit: this.limit},
    responseType: 'json'
  })
  return data
}

async function patchReadState(this: MicroLcNotificationCenter, _id: string, readState = true): Promise<void> {
  if(!_id) {
    throw new Error('`_id` cannot be undefined or an empty string')
  }

  const route = `${Routes.SetRead}/${_id}`
  await axios.patch<void, AxiosResponse<void>, ReadStateRequestBody>(`${this.endpoint}${route}`, {readState}, {headers: this.headers})
  return 
}

async function patchAllReadState(this: MicroLcNotificationCenter): Promise<number> {
  const route = `${Routes.SetRead}${Routes.Fetch}`
  const {data} = await axios.patch<number, AxiosResponse<number>, ReadStateRequestBody>(`${this.endpoint}${route}`, {readState: true}, {headers: this.headers})
  return data
} 

export {getNotifications, patchReadState, patchAllReadState, DEFAULT_PAGINATION_LIMIT}