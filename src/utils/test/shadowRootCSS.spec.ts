import {setCssVariables} from '../shadowRootCSS'

describe('css utils tests', () => {
  it('should return host object', () => {
    const root = setCssVariables('#fff')
    expect(root).toContain(':host{')
    expect(root).toContain('--ant-primary-color: #fff;')
    Array(7).fill(0).map((_, i) => {
      expect(root).toContain(`--ant-primary-${i+1}:`)
    })
  })

  it('should return root object', () => {
    const root = setCssVariables('#fff', 'root')
    expect(root).toContain(':root{')
  })
})