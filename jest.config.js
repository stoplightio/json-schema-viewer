module.exports = {
  preset: '@stoplight/scripts',
  testEnvironment: 'jsdom',
  setupTestFrameworkScriptFile: './setupTests.ts',
  snapshotSerializers: ['enzyme-to-json/serializer'],
  moduleNameMapper: {
    '\\.(css)$': '<rootDir>/__mocks__/styleMock.js',
  },
};
