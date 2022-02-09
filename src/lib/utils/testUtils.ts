import {Notification} from '../notification-center'

const START_DAYS_AGO = 90
const today = new Date()
const startFrom = new Date(today.getTime())
startFrom.setTime(today.getTime() - START_DAYS_AGO * 24 * 60 * 60 * 1000)

export function genId () {
  const timestamp = (new Date().getTime() / 1000 | 0).toString(16)
  return timestamp + 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function () {
    return (Math.random() * 16 | 0).toString(16)
  }).toLowerCase()
}

export function randomDate (start = startFrom, end = today): string {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString()
}

export function randomString (length = 10) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export const genNotifications = (quantity: number): Notification[] => Array(quantity).fill(0).map(() => ({
  _id: genId(),
  creatorId: genId(),
  createdAt: randomDate(),
  title: randomString(),
  readState: false,
  content: randomString(100),
  onClickCallback: {
    content: `?_q=${randomString(5)}`
  }
}))

export const randomNumber = (start = 0, end = 10) => Math.floor(Math.random() * end) + start
