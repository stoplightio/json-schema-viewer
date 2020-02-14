module.exports = {
  rootDir: process.cwd(),
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['./setupTests.ts'],
  moduleNameMapper: {
    '\\.css$': '<rootDir>/__mocks__/styleMock.js'
  },
  testMatch: ['<rootDir>/src/**/__tests__/*.(ts|js)?(x)'],
  transformIgnorePatterns: ['/node_modules/(?!lodash-es)/'],
  transform: {
    '\\.tsx?$': 'ts-jest',
    '^.+\\.js$': 'babel-jest'
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/', '/__stories__/', '__mocks__/', 'types.ts'],
  collectCoverageFrom: ['src/**/*.{ts,tsx}'],
  globals: {
    'ts-jest': {
      diagnostics: {
        ignoreCodes: [151001],
      },
    },
  },
};
