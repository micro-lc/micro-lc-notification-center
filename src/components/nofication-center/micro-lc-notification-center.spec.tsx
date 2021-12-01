import {h} from '@stencil/core'
import {newSpecPage, SpecPage} from '@stencil/core/testing'
import nock from 'nock'

import {JSX} from '../../components'
import {Notification} from '../../lib'
import {DEFAULT_PAGINATION_LIMIT} from '../../utils/notificationsClient'
import Sandbox, {AllNotifications, mockNotifications, waitForChanges} from '../../utils/testUtils'
import {MicroLcNotificationCenter} from './micro-lc-notification-center'

const DEFAULT_NOCK_ENDPOINT = 'http://localhost'
const NOTIFICATIONS = '/notifications'
const NOTIFICATIONS_FETCH = `${NOTIFICATIONS}/own`
const endpoint = `${DEFAULT_NOCK_ENDPOINT}${NOTIFICATIONS}`
const mocks = {react: ['createElement'], 'react-dom': ['render', 'unmountComponentAtNode']}

const ALL = 99
const UNREAD = 7
const allNotifications = new AllNotifications(ALL, UNREAD)

/**
 * initializes a nock get mock to the first 
 * batch of paginated notifications if status is 'ok'
 * otherwise gives a 500 if 'nok'
 * @param status {'ok' | 'nok'} http response status
 * @param skip pagination skip defualting to 0
 * @param limit pagination limit to DEFAULT_PAGINATION_LIMIT (= 10)
 * @returns nock scope
 */
function init (status: 'ok' | 'nok', skip = 0, limit = DEFAULT_PAGINATION_LIMIT): Notification[] | undefined {
  const scope = nock(DEFAULT_NOCK_ENDPOINT)
    .get(NOTIFICATIONS_FETCH)
    .query({skip, limit})
  if(status === 'ok') {
    const notifications = mockNotifications(limit)
    scope.reply(200, notifications)
    return notifications
  }

  scope.reply(500)
}

/**
 * Given a jest mock, it returns the `index`-th call
 * @param mock the jest mock
 * @param index the nth call index, if not provided it defaults to the last call
 * @returns the nth jest mock call
 */
function call<T = any, A extends any[] = any> ({mock: {calls}}: jest.Mock<T, A>, index?: number): A {
  const len = calls.length
  return calls[index ?? len - 1]
}

/**
 * utility function to create a new `spec-page` with a `micro-lc-notification-center`
 * embedded
 * @param props props to attach to `micro-lc-notification-center`
 * @returns a new `spec-page` promise
 */
async function create (props: JSX.MicroLcNotificationCenter = {}): Promise<SpecPage> {
  return newSpecPage({
    components: [MicroLcNotificationCenter],
    template: () => h('micro-lc-notification-center', props)//`<micro-lc-notification-center ${endpoint ?? ''}></micro-lc-notification-center>`
  })
}

async function initStandard (): Promise<SpecPage> {
  nock(DEFAULT_NOCK_ENDPOINT)
    .get(NOTIFICATIONS_FETCH)
    .query({skip: 0, limit: DEFAULT_PAGINATION_LIMIT})
    .reply(200, allNotifications.slice(0, DEFAULT_PAGINATION_LIMIT))
  const page = await create({endpoint})

  // await for first notifications batch
  await waitForChanges(page, () => {
    expect(nock.isDone()).toBe(true)
  })

  return page
}


nock.disableNetConnect()

describe('micro-lc-notification-center lifecycle tests', () => {
  const sandbox = new Sandbox(mocks)
  const sandboxMocks = sandbox.mock()

  afterAll(() => {
    sandbox.clearSandbox()
    jest.restoreAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
    expect(nock.isDone()).toBe(true)
    nock.cleanAll()
  })

  it('should fetching no notifications from default endopoint and thus set state done', async () => {
    nock(DEFAULT_NOCK_ENDPOINT)
      .get('/api/v1/micro-lc-notification-center/own')
      .query({skip: 0, limit: DEFAULT_PAGINATION_LIMIT})
      .reply(200, [])
    const {react: {createElement}} = sandboxMocks
    const page = await create()
    expect(call(createElement, 0)[1]).toMatchObject({
      loading: true, 
      notifications: [], 
      done: false
    })

    // await for fetching and check the response
    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })
    expect(call(createElement, 1)[1]).toMatchObject({
      loading: false, 
      notifications: [], 
      done: true
    })
  })

  it('should fetching less notifications than limit from default endopoint and thus set state done', async () => {
    const notifications = mockNotifications(1)
    nock(DEFAULT_NOCK_ENDPOINT)
      .get('/api/v1/micro-lc-notification-center/own')
      .query({skip: 0, limit: 2})
      .reply(200, notifications)
    const {react: {createElement}} = sandboxMocks
    const page = await create({limit: 2})
    expect(call(createElement, 0)[1]).toMatchObject({
      loading: true, 
      notifications: [], 
      done: false
    })

    // await for fetching and check the response
    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })
    expect(call(createElement, 1)[1]).toMatchObject({
      loading: false, 
      notifications, 
      done: true
    })
  })

  it('should render, then fetch notifications, after that it should be removed and on remount it should\'n fetch again', async () => {
    // init page with successful notifications fetch
    const {react: {createElement}, 'react-dom': {unmountComponentAtNode, render}} = sandboxMocks
    const notifications = init('ok')
    const page = await create({endpoint})
    expect(call(createElement, 0)[1]).toMatchObject({loading: true, notifications: []})

    // await for fetching and check the response
    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })
    expect(call(createElement, 1)[1]).toMatchObject({loading: false, notifications})

    // pick the host (which is root), remove it from the body
    // and check the react component is unmounted
    // and renders are 2
    const host = page.root
    page.body.removeChild(host)
    expect(unmountComponentAtNode).toBeCalledTimes(1)
    expect(render).toBeCalledTimes(2)

    // re-attach and check there's no extra nock get request
    page.body.appendChild(host)
    await waitForChanges(page, () => {
      expect(render).toBeCalledTimes(3)
    })
  })

  it('should render, and fail fatching while transmitting error status', async () => {
    // init page with unsuccessful notifications fetch
    init('nok')
    const {react: {createElement}} = sandboxMocks
    const page = await create({endpoint})
    expect(call(createElement, 0)[1]).toMatchObject({loading: true, notifications: []})

    // on failed fetch the `error` flag is true
    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })
    expect(call(createElement, 1)[1]).toMatchObject({loading: false, notifications: [], error: true})
  })

  it('should attempt double fetch, also setting a non-default limit', async () => {
    // init page with successful notifications fetch
    const limit = 5
    const {react: {createElement}} = sandboxMocks
    const p1 = init('ok', 0, limit)
    const page = await create({endpoint, limit})
    const {next} = call(createElement, 0)[1]

    // await for first notifications batch
    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })

    // click on next to fetch more notifications
    const p2 = init('ok', limit, limit)
    next()

    // check that all notifications are fetched
    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })
    expect(call(createElement, 2)[1]).toMatchObject({loading: false, notifications: [...p1, ...p2]})
  })

  it('should attempt reload after successful fetch', async () => {
    // init page with successful notifications fetch
    init('ok')
    const {react: {createElement}} = sandboxMocks
    const page = await create({endpoint})
    const {reload} = call(createElement, 0)[1]

    // await for first notifications batch
    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })

    // click on reload
    const p1 = init('ok')
    reload()

    // expect that notifications are in the same amount as before (pagination resets)
    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })
    expect(call(createElement, 2)[1]).toMatchObject({loading: false, notifications: p1})
  })

  it('should attempt reload after failed fetch', async () => {
    // init page with unsuccessful notifications fetch
    init('nok')
    const {react: {createElement}} = sandboxMocks
    const page = await create({endpoint})
    const {reload} = call(createElement, 0)[1]

    // wait for http request failure
    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })

    // attempt reload
    const p1 = init('ok')
    reload()

    // check that `error` is false and there's data
    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })
    expect(call(createElement, 2)[1]).toMatchObject({loading: false, notifications: p1, error: false})
  })

  it('should attempt reload after 2 pages', async () => {
    // init page with successful notifications fetch
    const limit = 21
    init('ok', 0, limit)
    const {react: {createElement}} = sandboxMocks
    const page = await create({endpoint, limit})
    const {next, reload} = call(createElement, 0)[1]

    // wait for first notifications batch
    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })

    // click next and await fetching
    init('ok', limit, limit)
    next()
    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })

    // click reload and check pagination reset
    const p1 = init('ok', 0, limit)
    reload()
    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })
    expect(call(createElement, 3)[1]).toMatchObject({loading: false, notifications: p1})
  })

  it('should notify some unread notifications', async () => {
    const {react: {createElement}} = sandboxMocks
    await initStandard()
    const {notifications} = call(createElement)[1]
    expect(notifications.filter(({readState}) => !readState)).toHaveLength(UNREAD)
    expect(notifications.filter(({readState}) => readState)).toHaveLength(DEFAULT_PAGINATION_LIMIT - UNREAD)
  })

  it('should click on unread notification', async () => {
    const {react: {createElement}} = sandboxMocks
    const page = await initStandard()
    const {notifications, onClick} = call(createElement)[1]
    const [notification] = notifications

    nock(DEFAULT_NOCK_ENDPOINT)
      .patch(`${NOTIFICATIONS}/read-state/${notification._id}`, {readState: true})
      .reply(200)
    onClick(notification, 0)
    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
    })
  })

  it('shouldn\'t do anything on readState === true', async () => {
    const {react: {createElement}} = sandboxMocks
    await initStandard()
    const {onClick} = call(createElement)[1]

    await onClick({readState: true})
  })

  it('should throw on `_id` empty string', async () => {
    const {react: {createElement}} = sandboxMocks
    await initStandard()
    const {onClick} = call(createElement)[1]

    await onClick({}).catch((err: any) => {
      expect(err.message).toStrictEqual('`_id` cannot be undefined or an empty string')
    })
  })

  it('should click on set all read', async () => {
    const {react: {createElement}} = sandboxMocks
    const page = await initStandard()
    const {onClickAll} = call(createElement)[1]

    nock(DEFAULT_NOCK_ENDPOINT)
      .patch(`${NOTIFICATIONS}/read-state/own`, {readState: true})
      .reply(200, '10')
    const number = await onClickAll()
    await waitForChanges(page, () => {
      expect(nock.isDone()).toBe(true)
      expect(number).toStrictEqual(10)
    })
  })
})