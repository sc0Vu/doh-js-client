module.exports = {
  transform: {
   '^.+\\.ts?$': 'ts-jest'
  },
  testEnvironment: 'node',
  // testRegex: '/__test__/.*\\.(test|spec)?\\.(ts|tsx)$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};