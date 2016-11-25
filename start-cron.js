const config = require('./config')
const log = require('./app/services/log')
var CronJob = require('cron').CronJob
var generateDirectPayments = require('./app/services/data/insert-task-generate-direct-payments')
var paymentCron = config.PAYMENT_GENERATION_CRON

var directPaymentJob = new CronJob({
  cronTime: paymentCron,
  onTick: function () {
    generateDirectPayments()
  },
  start: false
})


log.info(`Starting direct payment generation on schedule [${paymentCron}]`)
directPaymentJob.start()
