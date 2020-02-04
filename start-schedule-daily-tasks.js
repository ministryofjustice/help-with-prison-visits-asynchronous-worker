const appInsights = require('applicationinsights')
const config = require('./config')
appInsights.setup(config.APP_INSIGHTS_INSTRUMENTATION_KEY)
.setSendLiveMetrics(true)
appInsights.start()
const log = require('./app/services/log')
const Promise = require('bluebird')

var CronJob = require('cron').CronJob
var insertTask = require('./app/services/data/insert-task')
var dailyTasksCron = config.DAILY_TASKS_CRON
var taskTypes = require('./app/constants/tasks-enum')

// This script inserts daily tasks according to a CRON config value (e.g. every morning at 5am)
var dailyTasksJob = new CronJob({
  cronTime: dailyTasksCron,
  onTick: function () {
    log.info('CRON triggered - initiating run of daily tasks generation...')
    Promise.all([
      insertTask(null, null, null, taskTypes.SEND_PERFORMANCE_PLATFORM_METRICS_FOR_DAY),
      insertTask(null, null, null, taskTypes.SEND_ALL_ADVANCE_CLAIM_REMINDERS_FOR_DAY),
      insertTask(null, null, null, taskTypes.MARK_ALL_OVERPAYMENTS),
      insertTask(null, null, null, taskTypes.CLEANUP_OLD_DATA)])
      .then(function () {
        log.info('daily tasks created')
      })
  },
  start: false
})

log.info(`Starting daily tasks generation on schedule [${dailyTasksCron}]`)
dailyTasksJob.start()
