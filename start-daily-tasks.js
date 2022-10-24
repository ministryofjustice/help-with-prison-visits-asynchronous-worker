require('dotenv').config()
const appInsights = require('./app/azure-appinsights')
const log = require('./app/services/log')
const { sendAllAdvanceClaimRemindersForDay } = require('./app/services/workers/send-all-advance-claim-reminders-for-day')
const { sendRequestInformationRemindersForDay } = require('./app/services/workers/send-request-information-reminders-for-day')
const { markOverpayments } = require('./app/services/workers/mark-overpayments')
const { cleanupOldData } = require('./app/services/workers/cleanup-old-data')
const { autoRejectClaims } = require('./app/services/workers/auto-reject-claims')

log.info('Starting daily tasks')
  setTimeout(function() {
  Promise.all([
    sendAllAdvanceClaimRemindersForDay(),
    sendRequestInformationRemindersForDay(),
    markOverpayments(),
    cleanupOldData(),
    autoRejectClaims()])
    .then(function () {
      log.info('Daily tasks completed')
      if (appInsights) {
        appInsights.flush({ callback: () => process.exit() })
      }
    })
    .catch(function (error) {
      log.error('Failed daily tasks run', error)
      if (appInsights) {
        appInsights.flush({ callback: () => process.exit(1) })
      }
    })
    .finally(() => {
      process.exit()
    })
}, 5000)
