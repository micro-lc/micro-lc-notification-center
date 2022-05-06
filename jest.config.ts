/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

const jestConfig = {
  clearMocks: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/index.ts',
    '!src/**/*.*ss',
    '!**/node_modules/**'
  ],
  coverageReporters: [
    'text',
    'lcov',
    'cobertura'
  ],
  moduleNameMapper: {
    '^.+\\.(css|less)$': '<rootDir>/__mocks__/less.js',
    'antd\\/es': ['<rootDir>/node_modules/antd'],
    '@ant-design\\/icons\\/es\\/icons': ['<rootDir>/node_modules/@ant-design/icons']
  },
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': [
      'esbuild-jest',
      {
        sourcemap: true,
        loaders: {
          '.test.ts': 'tsx',
        }
      }
    ]
  },
  testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx)$',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transformIgnorePatterns: [
    'node_modules/(?!(@open-wc|@lit|lit|lit-html|lit-element)/)'
  ],
  setupFilesAfterEnv: [
    './__tests__/testSetup.ts'
  ]
}

export default jestConfig
