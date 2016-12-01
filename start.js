const config = require('./config')
const log = require('./app/services/log')
var CronJob = require('cron').CronJob
var processTasks = require('./app/process-tasks')

var asyncWorkerCron = config.ASYNC_WORKER_CRON
var numberOfWorkers = config.ASYNC_WORKER_CONCURRENCY
var startWeb = config.ASYNC_START_WEB === 'true'

for (var i = 0; i < numberOfWorkers; i++) {
  var workerId = i + 1

  var directPaymentJob = new CronJob({
    cronTime: asyncWorkerCron,
    onTick: function () {
      runProcessTasks(workerId)

      if (startWeb && workerId === 1) {
        // Start web
        require('./app/web/bin/www')
      }
    },
    onComplete: function () {
      log.info(`worker ${workerId} completed running task`)
    },
    start: false
  })
  log.info(`Started worker ${workerId}`)
  directPaymentJob.start()
}

function runProcessTasks (id) {
  return processTasks().then(function () {
    log.info(`worker ${id} completed running task`)
  })
}
