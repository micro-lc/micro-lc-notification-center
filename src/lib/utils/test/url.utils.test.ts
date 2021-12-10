import {genId, randomDate, randomString} from '../test.utils'
import {getLink} from '../url.utils'

describe('url utils tests', () => {
  it.each([
    ['/link', 'http://localhost/link'],
    ['https://google.com/link', 'http://localhost/link'],
    ['?_q=0', 'http://localhost/?_q=0'],
    ['https://google.com?_q=0', 'http://localhost/?_q=0']
  ])('should redirect %s to given %s', (content, expected) => {
    const notification = {
      _id: genId(),
      creatorId: genId(),
      createdAt: randomDate(),
      title: randomString(),
      readState: false,
      content: randomString(100),
      onClickCallback: {
        kind: 'href',
        content
      }
    }
    expect(getLink(notification).href).toStrictEqual(expected)
  })

  it('no onClickCallback', () => {
    expect(getLink({
      _id: genId(),
      creatorId: genId(),
      createdAt: randomDate(),
      title: randomString()
    })).toBeUndefined()
  })

  it('no `href` kind', () => {
    expect(getLink({
      _id: genId(),
      creatorId: genId(),
      createdAt: randomDate(),
      title: randomString(),
      onClickCallback: {
        kind: randomString(),
        content: randomString()
      }
    })).toBeUndefined()
  })
})
