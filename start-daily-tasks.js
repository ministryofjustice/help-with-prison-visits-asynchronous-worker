require('dotenv').config()
require('./app/azure-appinsights')
const log = require('./app/services/log')
const { sendAllAdvanceClaimRemindersForDay } = require('./app/services/workers/send-all-advance-claim-reminders-for-day')
const { sendRequestInformationRemindersForDay } = require('./app/services/workers/send-request-information-reminders-for-day')
const { markOverpayments } = require('./app/services/workers/mark-overpayments')
const { cleanupOldData } = require('./app/services/workers/cleanup-old-data')
const { autoRejectClaims } = require('./app/services/workers/auto-reject-claims')

log.info('Starting daily tasks')
Promise.all([
  sendAllAdvanceClaimRemindersForDay(),
  sendRequestInformationRemindersForDay(),
  markOverpayments(),
  cleanupOldData(),
  autoRejectClaims()])
  .then(function () {
    log.info('Daily tasks completed')
    process.exit()
  })
  .catch(function (error) {
    log.error('Failed daily tasks run', error)
    process.exit()
  })