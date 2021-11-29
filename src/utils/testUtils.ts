import {Notification} from '../lib'

const START_DAYS_AGO = 90
const today = new Date()
const startFrom = new Date(today.getTime())
startFrom.setTime(today.getTime() - START_DAYS_AGO * 24 * 60 * 60 * 1000)

function genId () {
    const timestamp = (new Date().getTime() / 1000 | 0).toString(16)
    return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
      return (Math.random() * 16 | 0).toString(16);
    }).toLowerCase()
}

function randomDate(start = startFrom, end = today) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomString(length = 10) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for ( var i = 0; i < length; i++ ) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

const mockNotifications = (quantity: number): Notification[] => Array(quantity).fill(0).map(() => ({
  _id: genId(),
  creatorId: genId(),
  createdAt: randomDate(),
  title: randomString()
}))

type WaitForOptions = {
  timeout: number
}

async function waitFor<T = any> (callback?: () => T, opts: WaitForOptions = {timeout: 3000}): Promise<T> {
  let reason: any = undefined
  let outsideResolve: (value: T | PromiseLike<T>) => void
  let outsideReject: (reason?: any) => void
  let promise = new Promise<T>((resolve, reject) => {
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
  setTimeout(() => {
    clearInterval(interval)
    outsideReject(reason)
  }, opts.timeout)

  return promise
}

export {mockNotifications, waitFor}
