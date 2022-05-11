/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

const jestConfig = {
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/typings.d.ts',
    '!src/index.min.ts',
    '!src/**/index.ts',
    '!src/**/*.less',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: [
    'text',
    'lcov',
    'cobertura'
  ],
  moduleNameMapper: {
    '@ln\\/(.*)\\.js': '<rootDir>/__mocks__/locale.js',
    '^.+\\.less$': '<rootDir>/__mocks__/less.js',
    'antd\\/es': ['<rootDir>/node_modules/antd'],
    '@ant-design\\/icons\\/es\\/icons': ['<rootDir>/node_modules/@ant-design/icons']
  },
  testEnvironment: 'jsdom',
  transform: {
    '\\.[jt]sx?$': 'ts-jest'
  },
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transformIgnorePatterns: [
    'node_modules/(?!(@open-wc|@lit|lit|lit-html|lit-element)/)'
  ],
  setupFilesAfterEnv: [
    './src/testSetup.ts'
  ]
}

export default jestConfig
