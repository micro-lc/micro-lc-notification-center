import {Config} from '@stencil/core'
import analyze from 'rollup-plugin-analyzer'
import nodePolyfills from 'rollup-plugin-node-polyfills'
import {typescriptPaths} from 'rollup-plugin-typescript-paths'

export const config: Config = {
  rollupPlugins: {
    after: [
      analyze({summaryOnly: true, limit: 5}),
      nodePolyfills(),
      typescriptPaths()
    ]
  },
  namespace: 'micro-lc-notification-center',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader'
    },
    {
      type: 'www',
      copy: [{src: 'assets', warn: true}],
      serviceWorker: null
    }
  ],
  testing: {
    setupFilesAfterEnv: ['<rootDir>/src/testSetup.ts'],
    roots: ['src'],
    moduleNameMapper: {
      '\\.css$': 'identity-obj-proxy',
      '~/(.*)$': '<rootDir>/src/$1'
    },
    testPathIgnorePatterns: ['/node_modules/', '/src/lib/'],
    collectCoverageFrom: [
      'src/components/**/*.tsx',
      'src/components/**/*.ts',
      'src/utils/**/*.ts',
      '!src/utils/testUtils.ts',
      '!/src/lib/'
    ],
    coverageThreshold: {
      global: {
        statements: 90,
        branches: 65,
        functions: 90,
        lines: 90
      }
    },
    coverageReporters: [
      'text',
      'lcov'
    ],
    coverageDirectory: 'coverage/webcomponents'
  }
}
