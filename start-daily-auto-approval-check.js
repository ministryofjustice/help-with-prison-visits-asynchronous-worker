require('dotenv').config()
const appInsights = require('./app/azure-appinsights')
const log = require('./app/services/log')
const { autoApproveClaims } = require('./app/services/workers/auto-approve-claims')

log.info('Starting auto approval checks')

autoApproveClaims()
  .then(function () {
    log.info('Auto approval checks completed')
    if (appInsights) {
      appInsights.flush({ callback: () => process.exit() })
    }
  })
  .catch(function (error) {
    log.error('Failed auto approval checks', error)
    if (appInsights) {
      appInsights.flush({ callback: () => process.exit(1) })
    }
  })
  .finally(() => {
    process.exit()
  })
