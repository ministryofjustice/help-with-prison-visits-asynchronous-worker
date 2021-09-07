require('dotenv').config()
require('./app/azure-appinsights')
const log = require('./app/services/log')
const { generateDirectPayments } = require('./workers/generate-direct-payments')
const { cleanupOldPaymentFiles } = require('./workers/cleanup-old-payment-files')
const { generatePayoutPayments } = require('./workers/generate-payout-payments')

log.info('Running payment generation job')

Promise.all([
  generateDirectPayments(),
  cleanupOldPaymentFiles(),
  generatePayoutPayments()])
  .then(function () {
    log.info('Payment generation jobs completed')
    process.exit()
  })
