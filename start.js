const config = require('./config')
const log = require('./app/services/log')
var CronJob = require('cron').CronJob
var throng = require('throng')
var processTasks = require('./app/process-tasks')
var generateDirectPayments = require('./app/services/data/insert-task-generate-direct-payments')

var numberOfWorkers = config.ASYNC_WORKER_CONCURRENCY
var frequency = config.ASYNC_WORKER_FREQUENCY
var startWeb = config.ASYNC_START_WEB === 'true'
var paymentCron = config.PAYMENT_GENERATION_CRON
var directPaymentJob = new CronJob({
  cronTime: paymentCron,
  onTick: function () {
    generateDirectPayments()
  },
  start: false
})

throng({
  workers: numberOfWorkers,
  master: startMaster,
  start: startWorker
})

function startMaster (id) {
  log.info(`Started master ${id} for cron schedule`)

  process.on('SIGTERM', () => {
    log.info(`Master ${id} exiting...`)
    process.exit()
  })

  log.info(`Starting direct payment generation on schedule [${paymentCron}]`)
  directPaymentJob.start()
}

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
