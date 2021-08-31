const tasksEnum = require('../constants/tasks-enum')
const sendAcceptedClaimNotification = require('./workers/send-accepted-claim-notification')
const sendRejectedClaimNotification = require('./workers/send-rejected-claim-notification')
const sendRequestInformationClaimNotification = require('./workers/send-request-information-claim-notification')
const sendRequestInformationResponseSubmittedNotification = require('./workers/send-request-information-response-submitted-notification')
const sendAdvanceClaimEvidenceReminderNotification = require('./workers/send-advance-claim-evidence-reminder-notification')
const sendUpdatedContactDetailsClaimNotification = require('./workers/send-updated-contact-details-claim-notification')
const sendClaimNotification = require('./workers/send-claim-notification')
const completeClaim = require('./workers/complete-claim')
const requestInformationResponse = require('./workers/request-information-response')
const dwpCheck = require('./workers/dwp-check')
const sendFeedback = require('./workers/send-feedback')
const sendMalwareUploadNotification = require('./workers/send-malware-notification')
const sendTechnicalHelp = require('./workers/send-technical-help')
const archiveOldClaims = require('./workers/archive-old-claims')
const archiveClaim = require('./workers/archive-claim')
const referenceRecovery = require('./workers/reference-recovery')
const dwpFailedNotification = require('./workers/send-claim-additional-information-required')
const autoApproveClaims = require('./workers/auto-approve-claims')
const sendRequestInformationReminderNotification = require('./workers/send-request-information-reminder-notification')

// ALL WORKERS SHOULD HAVE A METHOD `execute(task)` that returns a Promise
module.exports = function (taskType) {
  switch (taskType) {
    case tasksEnum.ACCEPT_CLAIM_NOTIFICATION: return sendAcceptedClaimNotification
    case tasksEnum.REJECT_CLAIM_NOTIFICATION: return sendRejectedClaimNotification
    case tasksEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION: return sendRequestInformationClaimNotification
    case tasksEnum.REQUEST_INFORMATION_RESPONSE_SUBMITTED_NOTIFICATION: return sendRequestInformationResponseSubmittedNotification
    case tasksEnum.ADVANCE_CLAIM_EVIDENCE_REMINDER_NOTIFICATION: return sendAdvanceClaimEvidenceReminderNotification
    case tasksEnum.UPDATED_CONTACT_DETAILS_CLAIM_NOTIFICATION: return sendUpdatedContactDetailsClaimNotification
    case tasksEnum.SEND_CLAIM_NOTIFICATION: return sendClaimNotification
    case tasksEnum.COMPLETE_CLAIM: return completeClaim
    case tasksEnum.REQUEST_INFORMATION_RESPONSE: return requestInformationResponse
    case tasksEnum.DWP_CHECK: return dwpCheck
    case tasksEnum.FEEDBACK_SUBMITTED: return sendFeedback
    case tasksEnum.SEND_MALWARE_ALERT: return sendMalwareUploadNotification
    case tasksEnum.TECHNICAL_HELP_SUBMITTED: return sendTechnicalHelp
    case tasksEnum.ARCHIVE_OLD_CLAIMS: return archiveOldClaims
    case tasksEnum.ARCHIVE_CLAIM: return archiveClaim
    case tasksEnum.REFERENCE_RECOVERY: return referenceRecovery
    case tasksEnum.DWP_FAILED_NOTIFICATION: return dwpFailedNotification
    case tasksEnum.AUTO_APPROVE_CLAIMS: return autoApproveClaims
    case tasksEnum.SEND_REQUEST_INFORMATION_REMINDER_NOTIFICATION: return sendRequestInformationReminderNotification
  }

  return null
}
