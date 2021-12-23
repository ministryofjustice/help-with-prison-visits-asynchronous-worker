const tasksEnum = require('../constants/tasks-enum')
const sendAcceptedClaimNotification = require('./workers/send-accepted-claim-notification')
const sendRejectedClaimNotification = require('./workers/send-rejected-claim-notification')
const sendRequestInformationClaimNotification = require('./workers/send-request-information-claim-notification')
const sendRequestInformationResponseSubmittedNotification = require('./workers/send-request-information-response-submitted-notification')
const sendAdvanceClaimEvidenceReminderNotification = require('./workers/send-advance-claim-evidence-reminder-notification')
const sendClaimNotification = require('./workers/send-claim-notification')
const completeClaim = require('./workers/complete-claim')
const requestInformationResponse = require('./workers/request-information-response')
const dwpCheck = require('./workers/dwp-check')
const sendMalwareUploadNotification = require('./workers/send-malware-notification')
const archiveOldClaims = require('./workers/archive-old-claims')
const archiveClaim = require('./workers/archive-claim')
const referenceRecovery = require('./workers/reference-recovery')
const dwpFailedNotification = require('./workers/send-claim-additional-information-required')
const autoApproveClaims = require('./workers/auto-approve-claims')
const sendRequestInformationReminderNotification = require('./workers/send-request-information-reminder-notification')

// ALL WORKERS SHOULD HAVE A METHOD `execute(task)` that returns a Promise
module.exports = function (taskType) {
  switch (taskType) {
    // From internal app
    case tasksEnum.ACCEPT_CLAIM_NOTIFICATION: return sendAcceptedClaimNotification
    case tasksEnum.REJECT_CLAIM_NOTIFICATION: return sendRejectedClaimNotification
    case tasksEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION: return sendRequestInformationClaimNotification
    case tasksEnum.REQUEST_INFORMATION_RESPONSE_SUBMITTED_NOTIFICATION: return sendRequestInformationResponseSubmittedNotification

    // From external app
    case tasksEnum.COMPLETE_CLAIM: return completeClaim
    case tasksEnum.REQUEST_INFORMATION_RESPONSE: return requestInformationResponse
    case tasksEnum.SEND_MALWARE_ALERT: return sendMalwareUploadNotification
    case tasksEnum.REFERENCE_RECOVERY: return referenceRecovery

    // Everything else
    case tasksEnum.ADVANCE_CLAIM_EVIDENCE_REMINDER_NOTIFICATION: return sendAdvanceClaimEvidenceReminderNotification
    case tasksEnum.SEND_CLAIM_NOTIFICATION: return sendClaimNotification
    case tasksEnum.DWP_CHECK: return dwpCheck
    case tasksEnum.ARCHIVE_OLD_CLAIMS: return archiveOldClaims
    case tasksEnum.ARCHIVE_CLAIM: return archiveClaim
    case tasksEnum.DWP_FAILED_NOTIFICATION: return dwpFailedNotification
    case tasksEnum.AUTO_APPROVE_CLAIMS: return autoApproveClaims
    case tasksEnum.SEND_REQUEST_INFORMATION_REMINDER_NOTIFICATION: return sendRequestInformationReminderNotification
  }

  return null
}
