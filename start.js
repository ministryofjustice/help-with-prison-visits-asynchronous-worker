const config = require('./config')
var throng = require('throng')
var processTasks = require('./app/process-tasks')

var numberOfWorkers = config.ASYNC_WORKER_CONCURRENCY
var frequency = config.ASYNC_WORKER_FREQUENCY

throng({ workers: numberOfWorkers }, startWorker)

function startWorker (id) {
  console.log(`Started worker ${id}!`)

  process.on('SIGTERM', () => {
    console.log(`Worker ${id} exiting...`)
    process.exit()
  })

  setIntervalSynchronous(function () {
    console.log(`worker ${id} run task ${new Date().getTime()}`)
    processTasks().then(function () {
      console.log(`worker ${id} completed running task`)
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
