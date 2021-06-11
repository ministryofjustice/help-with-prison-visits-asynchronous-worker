require('dotenv').config()
require('./app/azure-appinsights')
const log = require('./app/services/log')
const Promise = require('bluebird')
const insertTask = require('./app/services/data/insert-task')
const taskTypes = require('./app/constants/tasks-enum')

// This script inserts daily tasks according to a CRON config value (e.g. every morning at 5am)
log.info('Starting daily tasks generation')
Promise.all([
  insertTask(null, null, null, taskTypes.SEND_PERFORMANCE_PLATFORM_METRICS_FOR_DAY),
  insertTask(null, null, null, taskTypes.SEND_ALL_ADVANCE_CLAIM_REMINDERS_FOR_DAY),
  insertTask(null, null, null, taskTypes.SEND_REQUEST_INFORMATION_REMINDERS_FOR_DAY),
  insertTask(null, null, null, taskTypes.MARK_ALL_OVERPAYMENTS),
  insertTask(null, null, null, taskTypes.CLEANUP_OLD_DATA),
  insertTask(null, null, null, taskTypes.AUTO_REJECT_CLAIMS)])
  .then(function () {
    log.info('daily tasks created')
    process.exit()
  })
