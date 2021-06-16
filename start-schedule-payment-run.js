require('dotenv').config()
require('./app/azure-appinsights')
const log = require('./app/services/log')
const insertTask = require('./app/services/data/insert-task')
const taskTypes = require('./app/constants/tasks-enum')

// This script inserts a payment run task according to a CRON config value (e.g. every morning at 5am)
log.info('Creating payment generation tasks')

Promise.all([
  insertTask(null, null, null, taskTypes.GENERATE_DIRECT_PAYMENTS),
  insertTask(null, null, null, taskTypes.CLEANUP_OLD_PAYMENT_FILES),
  insertTask(null, null, null, taskTypes.GENERATE_PAYOUT_PAYMENTS)])
  .then(function () {
    log.info('Payment generation tasks created')
    process.exit()
  })
