/* eslint-disable */
export default {
  displayName: 'stargate-256-core',
  preset: '../../jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
    },
  },
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest',
  },
  transformIgnorePatterns: [ '<rootDir>/node_modules/*', '<rootDir>/*/node_modules/*'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/libs/stargate-256-core',
};
