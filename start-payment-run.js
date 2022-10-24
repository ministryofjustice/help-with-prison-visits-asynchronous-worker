require('dotenv').config()
const appInsights = require('./app/azure-appinsights')
const log = require('./app/services/log')
const { generateDirectPayments } = require('./app/services/workers/generate-direct-payments')
const { cleanupOldPaymentFiles } = require('./app/services/workers/cleanup-old-payment-files')
const { generatePayoutPayments } = require('./app/services/workers/generate-payout-payments')

log.info('Running payment generation job')

setTimeout(function() {
  Promise.all([
    generateDirectPayments(),
    cleanupOldPaymentFiles(),
    generatePayoutPayments()])
    .then(function () {
      log.info('Payment generation jobs completed')
      if (appInsights) {
        appInsights.flush({ callback: () => process.exit() })
      }
    })
    .catch(function (error) {
      log.error('Failed payment run', error)
      if (appInsights) {
        appInsights.flush({ callback: () => process.exit(1) })
      }
    })
    .finally(() => {
      process.exit()
    })
}, 5000)
