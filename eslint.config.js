// eslint-disable-next-line import/no-extraneous-dependencies
const hmppsConfig = require('@ministryofjustice/eslint-config-hmpps')

const config = hmppsConfig({
  extraIgnorePaths: ['assets/**/*.js'],
  extraPathsAllowingDevDependencies: ['.allowed-scripts.mjs'],
})
config.push({
  rules: {
    'no-param-reassign': 'off',
    'global-require': 'off',
  },
})

module.exports = config
