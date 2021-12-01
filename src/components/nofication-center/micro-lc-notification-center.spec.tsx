import {h} from '@stencil/core'
import {newSpecPage, SpecPage} from '@stencil/core/testing'
import nock from 'nock'

import {JSX} from '../../components'
import {Notification} from '../../lib'
import {DEFAULT_PAGINATION_LIMIT} from '../../utils/notificationsClient'
import Sandbox, {mockNotifications, waitForChanges} from '../../utils/testUtils'
import {MicroLcNotificationCenter} from './micro-lc-notification-center'

const DEFAULT_NOCK_ENDPOINT = 'http://localhost'
const NOTIFICATIONS = '/notifications'
const endpoint = `${DEFAULT_NOCK_ENDPOINT}${NOTIFICATIONS}`
const mocks = {react: ['createElement'], 'react-dom': ['render', 'unmountComponentAtNode']}

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
    .get(NOTIFICATIONS)
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
 * utility function to extract the `micro-lc-notification-center`
 * webcomponent and its parent
 * @param page 
 * @returns an object containing the `notificationCenter` and the `host`
 */
function _get (page: SpecPage): {notificationCenter: HTMLMicroLcNotificationCenterElement; host: HTMLElement} {
  const notificationCenter = page.body.querySelector('micro-lc-notification-center')
  return {notificationCenter, host: notificationCenter.parentElement}
}

/**
 * utility function to create a new `spec-page` with a `micro-lc-notification-center`
 * embedded
 * @param props props to attach to `micro-lc-notification-center`
 * @returns a new `spec-page` promise
 */
function create (props: JSX.MicroLcNotificationCenter = {}): Promise<SpecPage> {
  return newSpecPage({
    components: [MicroLcNotificationCenter],
    template: () => h('micro-lc-notification-center', props)//`<micro-lc-notification-center ${endpoint ?? ''}></micro-lc-notification-center>`
  })
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

  it('should avoid fetching notifications on absent endopoint', async () => {
    const {react: {createElement}} = sandboxMocks
    await create()
    expect(call(createElement, 0)[1]).toMatchObject({loading: undefined, notifications: []})
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

    // attempt DOM removal of the `notification-center`
    const {notificationCenter, host} = _get(page)
    notificationCenter.remove()
    expect(unmountComponentAtNode).toBeCalledTimes(1)

    // re-attaching and chech that there is no extra notifications fetch
    host.appendChild(notificationCenter)
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
})