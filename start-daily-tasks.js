require('dotenv').config()
const appInsights = require('./app/azure-appinsights')
const log = require('./app/services/log')
const {
  sendAllAdvanceClaimRemindersForDay,
} = require('./app/services/workers/send-all-advance-claim-reminders-for-day')
const {
  sendRequestInformationRemindersForDay,
} = require('./app/services/workers/send-request-information-reminders-for-day')
const { markOverpayments } = require('./app/services/workers/mark-overpayments')
const { cleanupOldData } = require('./app/services/workers/cleanup-old-data')
const { autoRejectClaims } = require('./app/services/workers/auto-reject-claims')

log.info('Starting daily tasks')

setTimeout(() => {
  Promise.all([
    sendAllAdvanceClaimRemindersForDay(),
    sendRequestInformationRemindersForDay(),
    markOverpayments(),
    cleanupOldData(),
    autoRejectClaims(),
  ])
    .then(() => {
      log.info('Daily tasks completed')
      if (appInsights) {
        appInsights.flush({ callback: () => process.exit() })
      } else {
        process.exit()
      }
    })
    .catch(error => {
      log.error('Failed daily tasks run', error)
      if (appInsights) {
        appInsights.flush({ callback: () => process.exit(1) })
      } else {
        process.exit(1)
      }
    })
}, 5000)
