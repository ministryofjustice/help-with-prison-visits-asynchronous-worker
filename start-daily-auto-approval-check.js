require('dotenv').config()
require('./app/azure-appinsights')
const log = require('./app/services/log')
const { autoApproveClaims } = require('./app/services/workers/auto-approve-claims')

log.info('Starting auto approval checks')

autoApproveClaims()
  .then(function () {
    log.info('Auto approval checks completed')
    process.exit()
  })
  .catch(function (error) {
    log.error('Failed auto approval checks', error)
    process.exit()
  })
