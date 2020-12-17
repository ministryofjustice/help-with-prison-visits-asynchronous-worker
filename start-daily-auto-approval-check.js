const appInsights = require('applicationinsights')
const config = require('./config')
appInsights.setup(config.APP_INSIGHTS_INSTRUMENTATION_KEY)
.setSendLiveMetrics(true)
appInsights.start()
const log = require('./app/services/log')
const Promise = require('bluebird')

const CronJob = require('cron').CronJob
const insertTask = require('./app/services/data/insert-task')
const autoApprovalCron = config.AUTO_APPROVAL_CRON
const taskTypes = require('./app/constants/tasks-enum')

// This script inserts auto approval, according to a CRON config value (e.g. every morning at 5am)
const autoApprovalJob = new CronJob({
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

log.info(`Starting auto approval checks on schedule [${autoApprovalCron}]`)
autoApprovalJob.start()
