import {parseCssVariable, setCssVariables} from '../css.utils'

describe('css utils tests', () => {
  it('should return root object', () => {
    const root = setCssVariables('#fff')
    expect(root).toContain(':root {')
    expect(root).toContain('--notification-center-primary-color: #fff;')
    Array(7).fill(0).map((_, i) => {
      expect(root).toContain(`--notification-center-color-${i+1}:`)
    })
  })
  it('should strip away js import/export declarations', () => {
    const file = `
const a = "csstexthere";
export default a
    `
    expect(parseCssVariable([file])).toStrictEqual('csstexthere')
  })
})