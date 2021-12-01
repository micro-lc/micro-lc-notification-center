import {generate} from '@ant-design/colors'
import {Config} from '@stencil/core'
import analyze from 'rollup-plugin-analyzer'
import css from 'rollup-plugin-import-css'
import nodePolyfills from 'rollup-plugin-node-polyfills'

/**
 * ANT Design holds a fixed set of default color variables
 * any css file that is imported needs to be parsed at compile-time
 * antd default hex colors are substituted with css vars scoped for this
 * notification center
 */
const ANTD_PRIMARY_COLOR = '#1890ff'
const NOTIFICATION_CENTER_CSS_VAR_PREFIX = '--notification-center'
const antPalette = generate(ANTD_PRIMARY_COLOR)

const replaceCssVariable = (obj: {text: string}, replace: string, name: string) => {
  obj.text = obj.text.replace(new RegExp(replace, 'ig'), `var(${NOTIFICATION_CENTER_CSS_VAR_PREFIX}-${name})`)
}

const transform = (text: string): string => {
  const textObj = {text}
  replaceCssVariable(textObj, ANTD_PRIMARY_COLOR, 'primary-color')
  replaceCssVariable(textObj, antPalette[0], 'color-1')
  replaceCssVariable(textObj, antPalette[1], 'color-2')
  replaceCssVariable(textObj, antPalette[2], 'color-3')
  replaceCssVariable(textObj, antPalette[3], 'color-4')
  replaceCssVariable(textObj, antPalette[4], 'color-5')
  replaceCssVariable(textObj, antPalette[5], 'color-6')
  replaceCssVariable(textObj, antPalette[6], 'color-7')
  return textObj.text
}

export const config: Config = {
  minifyJs: true,
  enableCache: true,
  rollupPlugins: {
    before: [
      css({transform}),
    ],
    after: [
      analyze({summaryOnly: true, limit: 5}),
      nodePolyfills()
    ]
  },
  namespace: 'micro-lc-notification-center',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'www',
      copy: [{'src': 'assets', warn: true}],
      serviceWorker: null,
    },
  ],
  testing: {
    roots: ['src'],
    moduleNameMapper:{
      '\\.css$': 'identity-obj-proxy'
    },
    testPathIgnorePatterns: ['/node_modules/', '/src/lib/'],
    collectCoverageFrom: [
      'src/components/**/*.tsx',
      '!/src/lib/'
    ],
    coverageThreshold: {
      global: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80
      }
    },
    coverageReporters: [
      'text',
      'lcov'
    ]
  }
}
