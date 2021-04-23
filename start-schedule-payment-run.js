require('dotenv').config()
const appInsights = require('applicationinsights')
const config = require('./config')
appInsights.setup(config.APP_INSIGHTS_INSTRUMENTATION_KEY)
  .setSendLiveMetrics(true)
appInsights.start()
const log = require('./app/services/log')
const CronJob = require('cron').CronJob
const insertTask = require('./app/services/data/insert-task')
const paymentCron = config.PAYMENT_GENERATION_CRON
const taskTypes = require('./app/constants/tasks-enum')

// This script inserts a payment run task according to a CRON config value (e.g. every morning at 5am)
const directPaymentJob = new CronJob({
  cronTime: paymentCron,
  onTick: function () {
    log.info('CRON triggered - initiating run of payments generation...')
    insertTask('', '', '', taskTypes.GENERATE_DIRECT_PAYMENTS)
      .then(function () {
        log.info('Direct Payment Generation task created')
      })
      .then(function () {
        insertTask('', '', '', taskTypes.CLEANUP_OLD_PAYMENT_FILES)
          .then(function () {
            log.info('Cleanup Old Payment Files task created')
          })
      })
      .then(function () {
        insertTask('', '', '', taskTypes.GENERATE_PAYOUT_PAYMENTS)
          .then(function () {
            log.info('Payout Payment Generation task created')
          })
      })
  },
  start: false
})

log.info(`Starting payment generation on schedule [${paymentCron}]`)
directPaymentJob.start()
