var tasksEnum = require('../constants/tasks-enum')
var sendAcceptedClaimNotification = require('./workers/send-accepted-claim-notification')
var sendRejectedClaimNotification = require('./workers/send-rejected-claim-notification')
var sendFirstTimeClaimNotification = require('./workers/send-first-time-claim-notification')

// ALL WORKERS SHOULD HAVE A METHOD `execute(task)` that returns a Promise
module.exports = function (taskType) {
  if (taskType === tasksEnum.ACCEPT_CLAIM_NOTIFICATION) {
    return sendAcceptedClaimNotification
  } else if (taskType === tasksEnum.REJECT_CLAIM_NOTIFICATION) {
    return sendRejectedClaimNotification
  } else if (taskType === tasksEnum.FIRST_TIME_CLAIM_NOTIFICATION) {
    return sendFirstTimeClaimNotification
  }
  return null
}
