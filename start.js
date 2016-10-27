const config = require('./config')
const log = require('./app/services/log')
var throng = require('throng')
var processTasks = require('./app/process-tasks')

var numberOfWorkers = config.ASYNC_WORKER_CONCURRENCY
var frequency = config.ASYNC_WORKER_FREQUENCY

throng({ workers: numberOfWorkers }, startWorker)

function startWorker (id) {
  log.info(`Started worker ${id}!`)

  process.on('SIGTERM', () => {
    log.info(`Worker ${id} exiting...`)
    process.exit()
  })

  setIntervalSynchronous(function () {
    log.info(`worker ${id} run task ${new Date().getTime()}`)
    processTasks().then(function () {
      log.info(`worker ${id} completed running task`)
      return
    })
  }, frequency)
}

function setIntervalSynchronous (func, delay) {
  var intervalFunction
  var timeoutId
  var clear

  clear = function () {
    clearTimeout(timeoutId)
  }

  intervalFunction = function () {
    func()
    timeoutId = setTimeout(intervalFunction, delay)
  }

  timeoutId = setTimeout(intervalFunction, delay)

  return clear
}
