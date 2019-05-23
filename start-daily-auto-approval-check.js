const config = require('./config')
const log = require('./app/services/log')
const Promise = require('bluebird')

var CronJob = require('cron').CronJob
var insertTask = require('./app/services/data/insert-task')
var autoApprovalCron = config.AUTO_APPROVAL_CRON
var taskTypes = require('./app/constants/tasks-enum')
                  
// This script inserts auto approval, according to a CRON config value (e.g. every morning at 5am)
var autoApprovalJob = new CronJob({
  cronTime: autoApprovalCron,
  onTick: function () {
    log.info('CRON triggered - initiating run of auto approval check')
    Promise.all([
      insertTask(null, null, null, taskTypes.AUTO_APPROVE_CLAIMS)])
      .then(function () {
        log.info('auto approval tasks created')
      })
  },
  start: false
})

log.info(`Starting auto approval checks on schedule [${dailyAutoApprovalCron}]`)
autoApprovalJob.start()
