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
  const characters = ' ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 '
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

function randomNumber (start = 0, end = 10) {
  return Math.floor(Math.random() * end) + start
}

function contentGenerator () {
  const words = ['The sky', 'above', 'the port', 'was', 'the color of television', 'tuned', 'to', 'a dead channel', '.', 'All', 'this happened', 'more or less', '.', 'I', 'had', 'the story', 'bit by bit', 'from various people', 'and', 'as generally', 'happens', 'in such cases', 'each time', 'it', 'was', 'a different story', '.', 'It', 'was', 'a pleasure', 'to', 'burn']
  const itaWords = ['Posso', 'andare', 'a', 'capo', 'durante', 'la', 'definizione', 'di', 'una', 'stringa', 'per', 'rendere', 'il', 'codice', 'più', 'pulito,', 'senza', 'però', 'aggiungere', 'implicitamente', 'il', 'carattere', 'di', 'new', 'line']
  const text = []
  const itaText = []
  Array(randomNumber(0, 30)).fill(0).forEach(() => {
    text.push(words[randomNumber(0, words.length)])
  })
  Array(randomNumber(0, 30)).fill(0).forEach(() => {
    itaText.push(itaWords[randomNumber(0, itaWords.length)])
  })

  return {en: text.join(' '), it: itaText.join(' ')}
}

const mockNotifications = (quantity) => Array(quantity).fill(0).map(() => ({
  _id: genId(),
  creatorId: genId(),
  createdAt: randomDate(),
  title: ['Email', {en: 'Appointment', it: 'Appuntamento'}, {en: 'Notification', it: 'Notifica'}, {en: 'Scheduled meeting', it: 'Appuntamento schedulato'}][randomNumber(0, 4)],
  content: contentGenerator(),
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
