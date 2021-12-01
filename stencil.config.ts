import {Config} from '@stencil/core'
import analyze from 'rollup-plugin-analyzer'
import nodePolyfills from 'rollup-plugin-node-polyfills'

export const config: Config = {
  minifyJs: true,
  enableCache: true,
  rollupPlugins: {
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
      'src/components/**/*.ts',
      'src/utils/**/*.ts',
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
