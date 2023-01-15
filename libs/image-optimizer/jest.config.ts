/* eslint-disable */
export default {
  displayName: 'image-optimizer',
  preset: '../../jest.preset.ts',
  globals: {
    'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' },
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/image-optimizer',
  coverageReporters: ['lcov'],
};
