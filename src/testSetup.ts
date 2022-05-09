import '@testing-library/jest-dom'
import 'construct-style-sheets-polyfill'
import {elementUpdated} from '@open-wc/testing-helpers'
import type {LocalizedNotification, MicroLcNotificationCenter} from './micro-lc-notification-center'

Object.defineProperty(global, 'console', {writable: true, value: {...console, error: jest.fn()}})

const {CSSStyleSheet} = global
class EnhancedCSSStyleSheet extends CSSStyleSheet {
  insertRule (_: string, index?: number): number {
    return index ?? 0
  }
}
Object.defineProperty(global, 'CSSStyleSheet', {writable: true, value: EnhancedCSSStyleSheet})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
})


// test utils 

const START_DAYS_AGO = 90
const today = new Date()
const startFrom = new Date(today.getTime())
startFrom.setTime(today.getTime() - START_DAYS_AGO * 24 * 60 * 60 * 1000)

function genId () {
  const timestamp = (new Date().getTime() / 1000 | 0).toString(16)
  return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
    return (Math.random() * 16 | 0).toString(16)
  }).toLowerCase()
}

function randomDate (start = startFrom, end = today): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString()
}

function randomString (length = 10) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export const mockNotifications = (quantity: number, intl = false): LocalizedNotification[] =>
  Array(quantity).fill(0).map(() => ({
    _id: genId(),
    creatorId: genId(),
    createdAt: randomDate(),
    title: intl ? {en: randomString(), it: randomString()} : randomString()
  }))

const oldestFirst = (a: string, b: string) => (a < b) ? -1 : ((a > b) ? 1 : 0)

export class AllNotifications {
  notifications: LocalizedNotification[]
  constructor (quantity: number, unread: number) {
    this.notifications = mockNotifications(quantity)
    this.notifications.sort(({createdAt: a}, {createdAt: b}) => -oldestFirst(a, b))
    this.notifications.forEach((_, i, arr) => {
      if (i >= unread) {
        arr[i].readState = true
      }
    })
  }

  slice (start?: number, end?: number): LocalizedNotification[] {
    return this.notifications.slice(start, end)
  }
}

type WaitForOptions = {
  timeout: number
}

export async function waitForChanges (
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
    .then(() => elementUpdated(page))
    .finally(() => {
      clearInterval(interval)
      clearTimeout(timeout)
    })
}
