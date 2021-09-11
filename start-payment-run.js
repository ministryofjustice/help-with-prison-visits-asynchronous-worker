require('dotenv').config()
require('./app/azure-appinsights')
const log = require('./app/services/log')
const { generateDirectPayments } = require('./app/services/workers/generate-direct-payments')
const { cleanupOldPaymentFiles } = require('./app/services/workers/cleanup-old-payment-files')
const { generatePayoutPayments } = require('./app/services/workers/generate-payout-payments')

log.info('Running payment generation job')

Promise.all([
  generateDirectPayments(),
  cleanupOldPaymentFiles(),
  generatePayoutPayments()])
  .then(function () {
    log.info('Payment generation jobs completed')
    process.exit()
  })
  .catch(function (error) {
    log.error('Failed payment run', error)
    process.exit()
  })
