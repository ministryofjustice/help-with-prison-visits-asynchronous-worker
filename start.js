const config = require('./config')
const log = require('./app/services/log')
var throng = require('throng')
var processTasks = require('./app/process-tasks')

var numberOfWorkers = config.ASYNC_WORKER_CONCURRENCY
var frequency = config.ASYNC_WORKER_FREQUENCY
var startWeb = config.ASYNC_START_WEB === 'true'

throng({ workers: numberOfWorkers }, startWorker)

function startWorker (id) {
  log.info(`Started worker ${id}`)

  process.on('SIGTERM', () => {
    log.info(`Worker ${id} exiting...`)
    process.exit()
  })

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

function runProcessTasks (id) {
  return processTasks().then(function () {
    log.info(`worker ${id} completed running task`)
  })
}
