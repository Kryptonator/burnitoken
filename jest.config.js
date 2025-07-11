// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['js', 'json'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupTests.js'],
  testMatch: ['**/*.test.js'], // Nur .test.js Dateien, nicht .spec.js
  testPathIgnorePatterns: ['/node_modules/', '/tests/e2e/', '\\.spec\\.js$'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['main.js', 'assets/scripts.js', '!**/node_modules/**'],
};
