require('dotenv').config()
const appInsights = require('./app/azure-appinsights')
const log = require('./app/services/log')
const { autoApproveClaims } = require('./app/services/workers/auto-approve-claims')

log.info('Starting auto approval checks')

setTimeout(() => {
  autoApproveClaims()
    .then(() => {
      log.info('Auto approval checks completed')
      if (appInsights) {
        appInsights.flush({ callback: () => process.exit() })
      }
    })
    .catch(error => {
      log.error('Failed auto approval checks', error)
      if (appInsights) {
        appInsights.flush({ callback: () => process.exit(1) })
      }
    })
    .finally(() => {
      process.exit()
    })
}, 5000)
