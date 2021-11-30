import {parseCssVariable, setCssVariables} from '../css.utils'

describe('css utils tests', () => {
  it('should return root object', () => {
    expect(setCssVariables('#fff')).toContain(':root {')
  })
  it('should strip away js import/export declarations', () => {
    const file = `
const a = "csstexthere";
export default a
    `
    expect(parseCssVariable([file])).toStrictEqual('csstexthere')
  })
})