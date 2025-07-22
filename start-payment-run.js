require('dotenv').config()
const appInsights = require('./app/azure-appinsights')
const log = require('./app/services/log')
const { generateDirectPayments } = require('./app/services/workers/generate-direct-payments')
const { cleanupOldPaymentFiles } = require('./app/services/workers/cleanup-old-payment-files')

log.info('Running payment generation job')

setTimeout(() => {
  Promise.all([generateDirectPayments(), cleanupOldPaymentFiles()])
    .then(() => {
      log.info('Payment generation jobs completed')
      if (appInsights) {
        appInsights.flush({ callback: () => process.exit() })
      } else {
        process.exit()
      }
    })
    .catch(error => {
      log.error('Failed payment run', error)
      if (appInsights) {
        appInsights.flush({ callback: () => process.exit(1) })
      } else {
        process.exit(1)
      }
    })
}, 5000)
