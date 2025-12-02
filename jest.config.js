export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // 👇 Esta parte soluciona el problema del CSS
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
};