require('dotenv').config()
require('./app/azure-appinsights')
const log = require('./app/services/log')
const insertTask = require('./app/services/data/insert-task')
const taskTypes = require('./app/constants/tasks-enum')

log.info('Creating daily tasks')
Promise.all([
  insertTask(null, null, null, taskTypes.SEND_PERFORMANCE_PLATFORM_METRICS_FOR_DAY),
  insertTask(null, null, null, taskTypes.SEND_ALL_ADVANCE_CLAIM_REMINDERS_FOR_DAY),
  insertTask(null, null, null, taskTypes.SEND_REQUEST_INFORMATION_REMINDERS_FOR_DAY),
  insertTask(null, null, null, taskTypes.MARK_ALL_OVERPAYMENTS),
  insertTask(null, null, null, taskTypes.CLEANUP_OLD_DATA),
  insertTask(null, null, null, taskTypes.AUTO_REJECT_CLAIMS)])
  .then(function () {
    log.info('Daily tasks created')
    process.exit()
  })
