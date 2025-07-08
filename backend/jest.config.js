// backend/jest.config.js
module.exports = {
  preset: '@shelf/jest-mongodb',
  testEnvironment: 'node',
  clearMocks: true,
  // Optional: Jest nach einer Testdatei suchen lassen, wenn sich der Code ändert
  // watchPathIgnorePatterns: ['./node_modules'],
};