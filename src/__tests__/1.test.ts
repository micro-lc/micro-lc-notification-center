import {elementUpdated, fixture, fixtureCleanup} from '@open-wc/testing-helpers'
import {html} from 'lit'

import '../micro-lc-notification-center'
import type {MicroLcNotificationCenter} from '../micro-lc-notification-center'
import {reactRender} from '../utils/engine'

jest.mock('../utils/engine', () => ({
  ...jest.requireActual('../utils/engine'),
  reactRender: jest.fn()
}))
jest.mock('../utils/client', () => ({
  createClient: jest.fn().mockReturnValue({
    getNotifications: jest.fn().mockResolvedValue([{}]),
    getCounts: jest.fn().mockResolvedValue({count: 1, unread: 1})
  })
}))

describe('', () => {
  afterEach(() => {
    fixtureCleanup()
  })
  it('should', async () => {
    const nc = await fixture<MicroLcNotificationCenter>(html`
      <micro-lc-notification-center
      ></micro-lc-notification-center>`
    )

    expect(nc.create?.().notifications).toEqual([{content: undefined, title: ''}])
    expect(reactRender).toBeCalledTimes(1)
  })
  
  it.only('should e', async () => {
    const nc = await fixture<MicroLcNotificationCenter>(html`
      <micro-lc-notification-center
      ></micro-lc-notification-center>`
    )

    const p = nc.parentElement
    nc.remove()
    p.appendChild(nc)

    await elementUpdated(nc)
  })
})