// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['js', 'json'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  testMatch: ['**/*.test.js'], // Nur .test.js Dateien, nicht .spec.js
  testPathIgnorePatterns: ['/tests/e2e/', '/.*\\.spec\\.js$/'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['main.js', 'assets/scripts.js', '!**/node_modules/**'],
  // Fix for nodemailer setImmediate issue
  testEnvironmentOptions: {
    url: 'http://localhost'
  },
  globals: {
    setImmediate: global.setImmediate || function(fn) { return setTimeout(fn, 0); },
    clearImmediate: global.clearImmediate || function(id) { return clearTimeout(id); }
  }
};
