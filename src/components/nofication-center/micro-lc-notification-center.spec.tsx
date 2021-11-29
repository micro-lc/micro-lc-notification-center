import React from 'react'

import {newSpecPage} from '@stencil/core/testing'
import nock from 'nock'
import ReactDOM from 'react-dom'

import {NotificationCenter} from '../../lib'
import {DEFAULT_PAGINATION_LIMIT} from '../../utils/notificationsClient'
import {mockNotifications} from '../../utils/testUtils'
import {MicroLcNotificationCenter} from './micro-lc-notification-center'

const DEFAULT_NOCK_ENDPOINT = 'http://localhost'
const NOTIFICATIONS = '/notifications'

function init (limit?: number) {
  const l = limit ?? DEFAULT_PAGINATION_LIMIT
  return nock(DEFAULT_NOCK_ENDPOINT)
    .get(NOTIFICATIONS)
    .query({skip: 0, limit: l})
    .reply(200, mockNotifications(l))
}

nock.disableNetConnect()

describe('micro-lc-notification-center lifecycle tests', () => {
  let createElement: any
  let render: any
  let unmountComponentAtNode: any
  beforeAll(() => {
    createElement = jest.requireActual('react').createElement
    jest.requireActual('react').createElement = jest.fn()

    render = jest.requireActual('react-dom').render
    unmountComponentAtNode = jest.requireActual('react-dom').unmountComponentAtNode
    jest.requireActual('react-dom').render = jest.fn()
    jest.requireActual('react-dom').unmountComponentAtNode = jest.fn()
  })
  afterAll(() => {
    jest.requireActual('react').createElement = createElement
    jest.requireActual('react-dom').render = render
    jest.requireActual('react-dom').unmountComponentAtNode = unmountComponentAtNode
  })
  afterEach(() => {
    expect(nock.isDone()).toBe(true)
  })
  it('should render, then fetch notifications, after that it should be removed and on remount it should\'n fetch again', async () => {
    init()
    
    // render
    const page = await newSpecPage({
      components: [MicroLcNotificationCenter],
      html: `<micro-lc-notification-center endpoint="${DEFAULT_NOCK_ENDPOINT}${NOTIFICATIONS}"></micro-lc-notification-center>`
    })

    // react is called an __be__ returns notifications --> 1st render
    expect(ReactDOM.render).toBeCalledTimes(1)
    expect(React.createElement).toBeCalledWith(NotificationCenter, expect.objectContaining({loading: true, notifications: []}))

    const notificationsCenter = page.body.querySelector('micro-lc-notification-center')
    const host = notificationsCenter.parentElement
    notificationsCenter.remove()
    expect(ReactDOM.unmountComponentAtNode).toBeCalledTimes(1)

    // re-attaching doesn't trigger another fetch
    host.appendChild(notificationsCenter)
    await page.waitForChanges()

    expect(ReactDOM.render).toBeCalledTimes(2)
  })
})