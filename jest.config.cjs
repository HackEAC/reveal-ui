/** @type {import('jest').Config} */
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  restoreMocks: true,
  roots: ['<rootDir>/test'],
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },
}
