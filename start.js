const appInsights = require('applicationinsights')
const config = require('./config')
appInsights.setup(config.APP_INSIGHTS_INSTRUMENTATION_KEY)
appInsights.start()
const log = require('./app/services/log')
var CronJob = require('cron').CronJob
var processTasks = require('./app/process-tasks')

var asyncWorkerCron = config.ASYNC_WORKER_CRON

var asyncWorkerJob = new CronJob({
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
    log.info(`worker completed running task`)
  })
}
