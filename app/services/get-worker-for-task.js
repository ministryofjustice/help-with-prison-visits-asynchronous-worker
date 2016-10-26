var tasksEnum = require('../constants/tasks-enum')
var sendFirstTimeClaimNotification = require('./workers/send-first-time-claim-notification')

// ALL WORKERS SHOULD HAVE A METHOD `execute(task)` that returns a Promise
module.exports = function (taskType) {
  if (taskType === tasksEnum.FIRST_TIME_CLAIM_NOTIFICATION) {
    return sendFirstTimeClaimNotification
  }
  return null
}
