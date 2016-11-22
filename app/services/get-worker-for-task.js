var tasksEnum = require('../constants/tasks-enum')
var sendAcceptedClaimNotification = require('./workers/send-accepted-claim-notification')
var sendRejectedClaimNotification = require('./workers/send-rejected-claim-notification')
var sendRequestInformationClaimNotification = require('./workers/send-request-information-claim-notification')
var sendFirstTimeClaimNotification = require('./workers/send-first-time-claim-notification')
var completeFirstTimeClaim = require('./workers/complete-first-time-claim')
var dwpCheck = require('./workers/dwp-check')
var generateDirectPayments = require('./workers/generate-direct-payments')

// ALL WORKERS SHOULD HAVE A METHOD `execute(task)` that returns a Promise
module.exports = function (taskType) {
  switch (taskType) {
    case tasksEnum.ACCEPT_CLAIM_NOTIFICATION: return sendAcceptedClaimNotification
    case tasksEnum.REJECT_CLAIM_NOTIFICATION: return sendRejectedClaimNotification
    case tasksEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION: return sendRequestInformationClaimNotification
    case tasksEnum.FIRST_TIME_CLAIM_NOTIFICATION: return sendFirstTimeClaimNotification
    case tasksEnum.COMPLETE_FIRST_TIME_CLAIM: return completeFirstTimeClaim
    case tasksEnum.DWP_CHECK: return dwpCheck
    case tasksEnum.GENERATE_DIRECT_PAYMENTS: return generateDirectPayments
  }

  return null
}
