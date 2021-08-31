require('dotenv').config()
require('./app/azure-appinsights')
const log = require('./app/services/log')
const sendPerformancePlatformMetricsForDay = require('./workers/send-performance-platform-metrics-for-day')
const sendAllAdvanceClaimRemindersForDay = require('./workers/send-all-advance-claim-reminders-for-day')
const sendRequestInformationRemindersForDay = require('./workers/send-request-information-reminders-for-day')
const markOverpayments = require('./workers/mark-overpayments')
const cleanupOldData = require('./workers/cleanup-old-data')
const autoRejectClaims = require('./workers/auto-reject-claims')

log.info('Starting daily tasks')
Promise.all([
  sendPerformancePlatformMetricsForDay(),
  sendAllAdvanceClaimRemindersForDay(),
  sendRequestInformationRemindersForDay(),
  markOverpayments(),
  cleanupOldData(),
  autoRejectClaims()])
  .then(function () {
    log.info('Daily tasks completed')
    process.exit()
  })
