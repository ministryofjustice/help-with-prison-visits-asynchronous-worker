var tasksEnum = require('../constants/tasks-enum')
var sendAcceptedClaimNotification = require('./workers/send-accepted-claim-notification')
var sendRejectedClaimNotification = require('./workers/send-rejected-claim-notification')
var sendRequestInformationClaimNotification = require('./workers/send-request-information-claim-notification')
var sendClaimNotification = require('./workers/send-claim-notification')
var completeClaim = require('./workers/complete-claim')
var requestInformationResponse = require('./workers/request-information-response')
var dwpCheck = require('./workers/dwp-check')
var generateDirectPayments = require('./workers/generate-direct-payments')
var cleanupOldPaymentFiles = require('./workers/cleanup-old-payment-files')

// ALL WORKERS SHOULD HAVE A METHOD `execute(task)` that returns a Promise
module.exports = function (taskType) {
  switch (taskType) {
    case tasksEnum.ACCEPT_CLAIM_NOTIFICATION: return sendAcceptedClaimNotification
    case tasksEnum.REJECT_CLAIM_NOTIFICATION: return sendRejectedClaimNotification
    case tasksEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION: return sendRequestInformationClaimNotification
    case tasksEnum.SEND_CLAIM_NOTIFICATION: return sendClaimNotification
    case tasksEnum.COMPLETE_CLAIM: return completeClaim
    case tasksEnum.REQUEST_INFORMATION_RESPONSE: return requestInformationResponse
    case tasksEnum.DWP_CHECK: return dwpCheck
    case tasksEnum.GENERATE_DIRECT_PAYMENTS: return generateDirectPayments
    case tasksEnum.CLEANUP_OLD_PAYMENT_FILES: return cleanupOldPaymentFiles
  }

  return null
}
