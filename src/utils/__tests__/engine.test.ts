import {createElement} from 'react'
import {render, unmountComponentAtNode} from 'react-dom'

import type {LitCreatable} from '../engine'
import {
  reactRender, unmount
} from '../engine'

jest.mock('react-dom', () => ({
  __esModule: true,
  render: jest.fn(),
  unmountComponentAtNode: jest.fn()
}))
jest.mock('react', () => ({
  __esModule: true,
  createElement: jest.fn()
}))

describe('reactRender tests', () => {
  it('should render a shadowed element', () => {
    reactRender.bind({
      Component: jest.fn(),
      renderRoot: document.body,
      create: () => ({})
    } as unknown as LitCreatable<unknown>)()

    expect(createElement).toBeCalledTimes(1)
    expect(render).toBeCalledTimes(1)
  })

  it('should not render when conditional rendering is false', () => {
    reactRender.bind({
      Component: jest.fn(),
      renderRoot: document.body,
      create: () => ({})
    } as unknown as LitCreatable<unknown>)({} as unknown as Document)

    expect(createElement).toBeCalled()
    expect(render).toBeCalledWith(undefined, {})
  })

  it('should not render an element created without props mapping', () => {
    reactRender.bind({
      Component: jest.fn(),
      renderRoot: document.body
    } as unknown as LitCreatable<unknown>)()

    expect(createElement).not.toBeCalled()
    expect(render).not.toBeCalled()
  })
})

describe('unmount tests', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })
  it('should call react unmount', () => {
    unmount.bind({} as LitCreatable<unknown>)()
    expect(unmountComponentAtNode).toBeCalled()
  })
})
