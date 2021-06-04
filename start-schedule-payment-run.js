require('dotenv').config()
require('./app/azure-appinsights')
const log = require('./app/services/log')
const insertTask = require('./app/services/data/insert-task')
const taskTypes = require('./app/constants/tasks-enum')

// This script inserts a payment run task according to a CRON config value (e.g. every morning at 5am)
log.info('Starting payment generation')

insertTask('', '', '', taskTypes.GENERATE_DIRECT_PAYMENTS)
  .then(function () {
    log.info('Direct Payment Generation task created')
  })
  .then(function () {
    insertTask('', '', '', taskTypes.CLEANUP_OLD_PAYMENT_FILES)
      .then(function () {
        log.info('Cleanup Old Payment Files task created')
      })
  })
  .then(function () {
    insertTask('', '', '', taskTypes.GENERATE_PAYOUT_PAYMENTS)
      .then(function () {
        log.info('Payout Payment Generation task created')
      })
  })
