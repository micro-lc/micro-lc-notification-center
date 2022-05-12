import Subscription from '../Subscription'

describe('Subscription tests', () => {
  it('should open a sub', () => {
    const s = new Subscription()
    expect(s.closed).toBe(false)
  })
  
  it('should open a sub and then close it', () => {
    const s = new Subscription()
    s.unsubscribe()
    expect(s.closed).toBe(true)
  })

  it('should run and `added` callback when open', () => {
    const s = new Subscription()
    const fn = jest.fn()
    const external = s.add(() => fn())

    external()
    expect(fn).toBeCalled()
  })
  
  it('should not run and `added` callback when closed', () => {
    const s = new Subscription()
    const fn = jest.fn()
    const external = s.add(() => fn())

    s.unsubscribe()
    external()
    expect(fn).not.toBeCalled()
  })
})