module.exports = {
  globals: {
    "ts-jest": {
      tsConfig: "tsconfig-test.json"
    }
  },
  clearMocks: true,
  moduleFileExtensions: ['js', 'ts'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  verbose: true,
};