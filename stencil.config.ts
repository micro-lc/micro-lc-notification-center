import {Config} from '@stencil/core'

export const config: Config = {
  namespace: 'micro-lc-notification-center',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'dist-custom-elements-bundle',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      copy: [{'src': 'assets', warn: true}],
      serviceWorker: null, // disable service workers
    },
  ],
  testing: {
    collectCoverage: true,
    testPathIgnorePatterns: ['/node_modules/', '/src/lib/'],
    collectCoverageFrom: ['/components/'],
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
