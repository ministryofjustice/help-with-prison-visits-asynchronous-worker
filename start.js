const config = require('./config')
const log = require('./app/services/log')
var throng = require('throng')
var processTasks = require('./app/process-tasks')
var scheduleGenerateDirectPayments = require('./app/services/data/insert-task-generate-direct-payments')

var numberOfWorkers = config.ASYNC_WORKER_CONCURRENCY
var frequency = config.ASYNC_WORKER_FREQUENCY
var startWeb = config.ASYNC_START_WEB === 'true'
var runJobs = 'true'

throng({ workers: numberOfWorkers }, startWorker)

function startWorker (id) {
  log.info(`Started worker ${id}`)

  process.on('SIGTERM', () => {
    log.info(`Worker ${id} exiting...`)
    process.exit()
  })

  // Testing - TODO: Schedule on Cron
  if (runJobs) {
    runScheduledJobs()
      .then(function () {
        runJobs = false
      })
  }

  runProcessTasks(id).then(function () {
    setInterval(function () {
      runProcessTasks(id)
    }, frequency)
  })

  if (startWeb && id === 1) {
    // Start web
    require('./app/web/bin/www')
  }
}

function runScheduledJobs (id) {
  return scheduleGenerateDirectPayments()
}

function runProcessTasks (id) {
  return processTasks().then(function () {
    log.info(`worker ${id} completed running task`)
  })
}
