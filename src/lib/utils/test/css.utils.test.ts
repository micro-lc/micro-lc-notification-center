import {parseCssVariable} from '../css.utils'

describe('css utils tests', () => {
  it('should strip away js import/export declarations', () => {
    const file = 'csstexthere'
    expect(parseCssVariable([file])).toStrictEqual('csstexthere')
  })
})
