import React from 'react'

import {newSpecPage} from '@stencil/core/testing'
import nock from 'nock'
import ReactDOM from 'react-dom'

import {DEFAULT_PAGINATION_LIMIT} from '../../utils/notificationsClient'
import {mockNotifications, waitForChanges} from '../../utils/testUtils'
import {MicroLcNotificationCenter} from './micro-lc-notification-center'

const DEFAULT_NOCK_ENDPOINT = 'http://localhost'
const NOTIFICATIONS = '/notifications'

/**
 * initializes a nock get mock to the first 
 * batch of paginated notifications
 * @param limit pagination limit to DEFAULT_PAGINATION_LIMIT = 10
 * @param skip pagination skip defualting to 0
 * @returns nock scope
 */
function init (limit?: number, skip = 0) {
  const l = limit ?? DEFAULT_PAGINATION_LIMIT
  const notifications = mockNotifications(l)
  nock(DEFAULT_NOCK_ENDPOINT)
    .get(NOTIFICATIONS)
    .query({skip, limit: l})
    .reply(200, notifications)
  return notifications
}

/**
 * initializes a nock get mock that returns 500
 * @param limit pagination limit to DEFAULT_PAGINATION_LIMIT = 10
 * @param skip pagination skip defualting to 0
 */
function init500 (limit?: number, skip = 0) {
  const l = limit ?? DEFAULT_PAGINATION_LIMIT
  nock(DEFAULT_NOCK_ENDPOINT)
    .get(NOTIFICATIONS)
    .query({skip, limit: l})
    .reply(500)
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
    jest.resetAllMocks()
    expect(nock.isDone()).toBe(true)
  })

  it('should avoid fetching notifications on absent endopoint', async () => {
    await newSpecPage({
      components: [MicroLcNotificationCenter],
      html: '<micro-lc-notification-center></micro-lc-notification-center>'
    })
    // @ts-ignore
    expect(React.createElement.mock.calls[0][1]).toMatchObject({loading: undefined, notifications: []})
  })

  it('should render, then fetch notifications, after that it should be removed and on remount it should\'n fetch again', async () => {
    const notifications = init()
    const page = await newSpecPage({
      components: [MicroLcNotificationCenter],
      html: `<micro-lc-notification-center endpoint="${DEFAULT_NOCK_ENDPOINT}${NOTIFICATIONS}"></micro-lc-notification-center>`
    })

    // @ts-ignore
    expect(React.createElement.mock.calls[0][1]).toMatchObject({loading: true, notifications: []})

    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })

    // @ts-ignore
    expect(React.createElement.mock.calls[1][1]).toMatchObject({loading: false, notifications})

    const notificationsCenter = page.body.querySelector('micro-lc-notification-center')
    const host = notificationsCenter.parentElement
    notificationsCenter.remove()
    expect(ReactDOM.unmountComponentAtNode).toBeCalledTimes(1)

    // re-attaching doesn't trigger another fetch
    host.appendChild(notificationsCenter)
    await page.waitForChanges()

    expect(ReactDOM.render).toBeCalledTimes(3)
  })

  it('should render, and fail fatching while transmitting error status', async () => {
    init500()
    const page = await newSpecPage({
      components: [MicroLcNotificationCenter],
      html: `<micro-lc-notification-center endpoint="${DEFAULT_NOCK_ENDPOINT}${NOTIFICATIONS}"></micro-lc-notification-center>`
    })

    // @ts-ignore
    expect(React.createElement.mock.calls[0][1]).toMatchObject({loading: true, notifications: []})

    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })

    // @ts-ignore
    expect(React.createElement.mock.calls[1][1]).toMatchObject({loading: false, notifications: [], error: true})
  })

  it('should attempt double fetch', async () => {
    const p1 = init(DEFAULT_PAGINATION_LIMIT)

    const page = await newSpecPage({
      components: [MicroLcNotificationCenter],
      html: `<micro-lc-notification-center endpoint="${DEFAULT_NOCK_ENDPOINT}${NOTIFICATIONS}"></micro-lc-notification-center>`
    })

    // @ts-ignore
    const {next} = React.createElement.mock.calls[0][1]

    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })

    const p2 = init(DEFAULT_PAGINATION_LIMIT, DEFAULT_PAGINATION_LIMIT)
    next()

    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })

    // @ts-ignore
    expect(React.createElement.mock.calls[2][1]).toMatchObject({loading: false, notifications: [...p1, ...p2]})
  })

  it('should attempt reload after successful fetch', async () => {
    init()

    const page = await newSpecPage({
      components: [MicroLcNotificationCenter],
      html: `<micro-lc-notification-center endpoint="${DEFAULT_NOCK_ENDPOINT}${NOTIFICATIONS}"></micro-lc-notification-center>`
    })

    // @ts-ignore
    const {reload} = React.createElement.mock.calls[0][1]

    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })

    const p1 = init()
    reload()

    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })

    // @ts-ignore
    expect(React.createElement.mock.calls[2][1]).toMatchObject({loading: false, notifications: p1})
  })

  it('should attempt reload after failed fetch', async () => {
    init500()

    const page = await newSpecPage({
      components: [MicroLcNotificationCenter],
      html: `<micro-lc-notification-center endpoint="${DEFAULT_NOCK_ENDPOINT}${NOTIFICATIONS}"></micro-lc-notification-center>`
    })

    // @ts-ignore
    const {reload} = React.createElement.mock.calls[0][1]

    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })

    const p1 = init()
    reload()

    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })

    // @ts-ignore
    expect(React.createElement.mock.calls[2][1]).toMatchObject({loading: false, notifications: p1})
  })

  it('should attempt reload after 2 pages', async () => {
    init(DEFAULT_PAGINATION_LIMIT)

    const page = await newSpecPage({
      components: [MicroLcNotificationCenter],
      html: `<micro-lc-notification-center endpoint="${DEFAULT_NOCK_ENDPOINT}${NOTIFICATIONS}"></micro-lc-notification-center>`
    })

    // @ts-ignore
    const {next, reload} = React.createElement.mock.calls[0][1]

    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })

    init(DEFAULT_PAGINATION_LIMIT, DEFAULT_PAGINATION_LIMIT)
    next()

    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })

    const p1 = init(DEFAULT_PAGINATION_LIMIT)
    reload()
    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })

    // @ts-ignore
    expect(React.createElement.mock.calls[3][1]).toMatchObject({loading: false, notifications: p1})
  })
})