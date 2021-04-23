require('dotenv').config()
const appInsights = require('applicationinsights')
const config = require('./config')
appInsights.setup(config.APP_INSIGHTS_INSTRUMENTATION_KEY)
  .setSendLiveMetrics(true)
appInsights.start()
const log = require('./app/services/log')
const CronJob = require('cron').CronJob
const processTasks = require('./app/process-tasks')

const asyncWorkerCron = config.ASYNC_WORKER_CRON

const asyncWorkerJob = new CronJob({
  cronTime: asyncWorkerCron,
  onTick: function () {
    runProcessTasks()
  },
  onComplete: function () {
    log.info('worker completed running task')
  },
  start: false
})
log.info('Started worker')
asyncWorkerJob.start()

function runProcessTasks () {
  return processTasks().then(function () {
    log.info('worker completed running task')
  })
}
