const config = require('./config')
const log = require('./app/services/log')
var CronJob = require('cron').CronJob
var insertTask = require('./app/services/data/insert-task')
var paymentCron = config.PAYMENT_GENERATION_CRON
var taskTypes = require('./app/constants/tasks-enum')

// This script inserts a payment run task according to a CRON config value (e.g. every morning at 5am)
var directPaymentJob = new CronJob({
  cronTime: paymentCron,
  onTick: function () {
    log.info('CRON triggered - initiating run of direct payments generation...')
    insertTask('', '', '', taskTypes.GENERATE_DIRECT_PAYMENTS).then(function () {
      log.info('Direct Payment Generation task created')
    })
  },
  start: false
})

log.info(`Starting direct payment generation on schedule [${paymentCron}]`)
directPaymentJob.start()
