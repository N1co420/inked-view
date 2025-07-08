// backend/jest.config.js
module.exports = {
  preset: '@shelf/jest-mongodb',
  testEnvironment: 'node',
  clearMocks: true,
  setupFiles: ['./tests/setup.js'],
  // Optional: Jest nach einer Testdatei suchen lassen, wenn sich der Code ändert
  // watchPathIgnorePatterns: ['./node_modules'],
};