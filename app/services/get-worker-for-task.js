var tasksEnum = require('../constants/tasks-enum')
var sendAcceptedClaimNotification = require('./workers/send-accepted-claim-notification')
var sendRejectedClaimNotification = require('./workers/send-rejected-claim-notification')
var sendRequestInformationClaimNotification = require('./workers/send-request-information-claim-notification')
var sendRequestInformationResponseSubmittedNotification = require('./workers/send-request-information-response-submitted-notification')
var sendAdvanceClaimEvidenceReminderNotification = require('./workers/send-advance-claim-evidence-reminder-notification')
var sendClaimNotification = require('./workers/send-claim-notification')
var completeClaim = require('./workers/complete-claim')
var requestInformationResponse = require('./workers/request-information-response')
var dwpCheck = require('./workers/dwp-check')
var sendPerformancePlatformMetricsForDay = require('./workers/send-performance-platform-metrics-for-day')
var sendAllAdvanceClaimRemindersForDay = require('./workers/send-all-advance-claim-reminders-for-day')
var generateDirectPayments = require('./workers/generate-direct-payments')
var cleanupOldPaymentFiles = require('./workers/cleanup-old-payment-files')
var markOverpayments = require('./workers/mark-overpayments')
var sendFeedback = require('./workers/send-feedback')
var cleanupOldData = require('./workers/cleanup-old-data')
var sendMalwareUploadNotification = require('./workers/send-malware-notification')
var sendTechnicalHelp = require('./workers/send-technical-help')
var archiveOldClaims = require('./workers/archive-old-claims')
var archiveClaim = require('./workers/archive-claim')

// ALL WORKERS SHOULD HAVE A METHOD `execute(task)` that returns a Promise
module.exports = function (taskType) {
  switch (taskType) {
    case tasksEnum.ACCEPT_CLAIM_NOTIFICATION: return sendAcceptedClaimNotification
    case tasksEnum.REJECT_CLAIM_NOTIFICATION: return sendRejectedClaimNotification
    case tasksEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION: return sendRequestInformationClaimNotification
    case tasksEnum.REQUEST_INFORMATION_RESPONSE_SUBMITTED_NOTIFICATION: return sendRequestInformationResponseSubmittedNotification
    case tasksEnum.ADVANCE_CLAIM_EVIDENCE_REMINDER_NOTIFICATION: return sendAdvanceClaimEvidenceReminderNotification
    case tasksEnum.SEND_CLAIM_NOTIFICATION: return sendClaimNotification
    case tasksEnum.COMPLETE_CLAIM: return completeClaim
    case tasksEnum.REQUEST_INFORMATION_RESPONSE: return requestInformationResponse
    case tasksEnum.DWP_CHECK: return dwpCheck
    case tasksEnum.SEND_PERFORMANCE_PLATFORM_METRICS_FOR_DAY: return sendPerformancePlatformMetricsForDay
    case tasksEnum.SEND_ALL_ADVANCE_CLAIM_REMINDERS_FOR_DAY: return sendAllAdvanceClaimRemindersForDay
    case tasksEnum.GENERATE_DIRECT_PAYMENTS: return generateDirectPayments
    case tasksEnum.CLEANUP_OLD_PAYMENT_FILES: return cleanupOldPaymentFiles
    case tasksEnum.MARK_ALL_OVERPAYMENTS: return markOverpayments
    case tasksEnum.FEEDBACK_SUBMITTED: return sendFeedback
    case tasksEnum.CLEANUP_OLD_DATA: return cleanupOldData
    case tasksEnum.SEND_MALWARE_ALERT: return sendMalwareUploadNotification
    case tasksEnum.TECHNICAL_HELP_SUBMITTED: return sendTechnicalHelp
    case tasksEnum.ARCHIVE_OLD_CLAIMS: return archiveOldClaims
    case tasksEnum.ARCHIVE_CLAIM: return archiveClaim
  }

  return null
}
