import {SpecPage} from '@stencil/core/internal'

import {LocalizedNotification} from '../components/notification-center/micro-lc-notification-center'

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

const mockNotifications = (quantity: number, intl = false): LocalizedNotification[] =>
  Array(quantity).fill(0).map(() => ({
    _id: genId(),
    creatorId: genId(),
    createdAt: randomDate(),
    title: intl ? {en: randomString(), it: randomString()} : randomString()
  }))

const oldestFirst = (a: string, b: string) => (a < b) ? -1 : ((a > b) ? 1 : 0)

class AllNotifications {
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

async function waitForChanges<T = any> (page: SpecPage, callback?: () => T, opts: WaitForOptions = {timeout: 3000}): Promise<T> {
  let reason: any
  let outsideResolve: (value: T | PromiseLike<T>) => void
  let outsideReject: (reason?: any) => void
  const promise = new Promise<T>((resolve, reject) => {
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
    .then(() => page.waitForChanges())
    .finally(() => {
      clearInterval(interval)
      clearTimeout(timeout)
    })
}

type MethodsToMockByModule = Record<string, string[]>

export type MocksMap = Record<string, Record<string, jest.Mock>>

export default class Sandbox {
  private mocksMap: MethodsToMockByModule = {}
  private actuals: MocksMap = {}

  constructor (mocksMap: MethodsToMockByModule) {
    this.mocksMap = mocksMap
    Object.entries(mocksMap).reduce(
      (acc, [module, methods]) => {
        methods.forEach(method => {
          let actual: any
          try {
            actual = jest.requireActual(module)[method]
            if (acc[module]) {
              acc[module][method] = actual
            } else {
              acc[module] = {[method]: actual}
            }
          } catch (err) {
            throw new Error(`cannot require method: ${method} on module: ${module}. Sandbox constructor threw: ${err}`)
          }
        })
        return acc
      }, this.actuals as MocksMap)
  }

  mock (): MocksMap {
    return Object.entries(this.mocksMap).reduce((mocks, [module, methods]) => {
      methods.forEach(method => {
        try {
          const mock = jest.fn()
          jest.requireActual(module)[method] = mock
          if (mocks[module]) {
            mocks[module][method] = mock
          } else {
            mocks[module] = {[method]: mock}
          }
        } catch (err) {
          throw new Error(`cannot require method: ${method} on module: ${module}. mock threw: ${err}`)
        }
      })
      return mocks
    }, {} as MocksMap)
  }

  clearSandbox (): void {
    Object.entries(this.mocksMap).forEach(([module, methods]) => {
      methods.forEach(method => {
        try {
          jest.requireActual(module)[method] = this.actuals[module]?.[method]
        } catch (err) {
          throw new Error(`cannot require method: ${method} on module: ${module}. clearSandbox threw: ${err}`)
        }
      })
    })
    this.actuals = {}
  }
}

export {mockNotifications, waitForChanges, Sandbox, AllNotifications}
