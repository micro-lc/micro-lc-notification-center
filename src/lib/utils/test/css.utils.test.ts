import {parseCssVariable, setCssVariables} from '../css.utils'

describe('css utils tests', () => {
  it('should return root object', () => {
    const root = setCssVariables('#fff')
    expect(root).toContain(':root{')
    expect(root).toContain('--ant-primary-color: #fff;')
    Array(7).fill(0).map((_, i) => {
      expect(root).toContain(`--ant-primary-${i+1}:`)
    })
  })
  it('should strip away js import/export declarations', () => {
    const file = 'csstexthere'
    expect(parseCssVariable([file])).toStrictEqual('csstexthere')
  })
})