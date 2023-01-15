/* eslint-disable */
export default {
  displayName: 'builders',
  preset: '../../jest.preset.ts',
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/builders',
  coverageReporters: ['lcov'],
  maxWorkers: 1,
};
