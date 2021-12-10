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

function randomDate (start = startFrom, end = today) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomString (length = 10) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 '
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

const mockNotifications = (quantity) => Array(quantity).fill(0).map(() => ({
  _id: genId(),
  creatorId: genId(),
  createdAt: randomDate(),
  title: randomString(),
  content: randomString(100),
  onClickCallback: {
    kind: 'href',
    content: `?_q=${randomString(5)}`
  }
}))

const oldestFirst = (a, b) => (a < b) ? -1 : ((a > b) ? 1 : 0)

class AllNotifications {
  notifications
  constructor (quantity, unread) {
    this.notifications = mockNotifications(quantity)
    this.notifications.sort(({createdAt: a}, {createdAt: b}) => -oldestFirst(a, b))
    this.notifications.forEach((_, i, arr) => {
      if (i >= unread) {
        arr[i].readState = true
      }
    })
  }

  slice (start, end) {
    return this.notifications.slice(start, end)
  }

  patch (_id, readState) {
    this.notifications = this.notifications.map((el) => {
      if (el._id === _id) {
        return {...el, readState}
      }
      return el
    })
  }

  patchAll (readState) {
    this.notifications = this.notifications.map((el) => {
      return {...el, readState}
    })
  }
}

const notifications = new AllNotifications(20, 8)

module.exports = {notifications}
