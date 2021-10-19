const expect = require('chai').expect
const proxyquire = require('proxyquire')
const tasksEnum = require('../../../app/constants/tasks-enum')

const sendAcceptedClaimNotification = { name: 'sendAcceptedClaimNotification' }
const sendRejectedClaimNotification = { name: 'sendRejectedClaimNotification' }
const sendRequestInformationClaimNotification = { name: 'sendRequestInformationClaimNotification' }
const sendRequestInformationResponseSubmittedNotification = { name: 'sendRequestInformationResponseSubmittedNotification' }
const sendAdvanceClaimEvidenceReminderNotification = { name: 'sendAdvanceClaimEvidenceReminderNotification' }
const sendUpdatedContactDetailsClaimNotification = { name: 'sendUpdatedContactDetailsClaimNotification' }
const sendClaimNotification = { name: 'sendClaimNotification' }
const completeClaim = { name: 'completeClaim' }
const requestInformationResponse = { name: 'requestInformationResponse' }
const dwpCheck = { name: 'dwpCheck' }
const sendAllAdvanceClaimRemindersForDay = { name: 'sendAllAdvanceClaimRemindersForDay' }
const cleanupOldPaymentFiles = { name: 'cleanupOldPaymentFiles' }
const markOverpayments = { name: 'markOverpayments' }
const sendFeedback = { name: 'sendFeedback' }
const cleanupOldData = { name: 'cleanupOldData' }
const sendTechnicalHelp = { name: 'sendTechnicalHelp' }
const archiveOldClaims = { name: 'archiveOldClaims' }
const archiveClaim = { name: 'archiveClaim' }
const referenceRecovery = { name: 'referenceRecovery' }
const generatePayoutPayments = { name: 'generatePayoutPayments' }
const generateDirectPayments = { name: 'generateDirectPayments' }
const sendMalwareAlert = { name: 'sendMalwareAlert' }

const getWorkerForTask = proxyquire('../../../app/services/get-worker-for-task', {
  './workers/send-accepted-claim-notification': sendAcceptedClaimNotification,
  './workers/send-rejected-claim-notification': sendRejectedClaimNotification,
  './workers/send-request-information-claim-notification': sendRequestInformationClaimNotification,
  './workers/send-request-information-response-submitted-notification': sendRequestInformationResponseSubmittedNotification,
  './workers/send-advance-claim-evidence-reminder-notification': sendAdvanceClaimEvidenceReminderNotification,
  './workers/send-updated-contact-details-claim-notification': sendUpdatedContactDetailsClaimNotification,
  './workers/send-claim-notification': sendClaimNotification,
  './workers/complete-claim': completeClaim,
  './workers/request-information-response': requestInformationResponse,
  './workers/dwp-check': dwpCheck,
  './workers/send-all-advance-claim-reminders-for-day': sendAllAdvanceClaimRemindersForDay,
  './workers/cleanup-old-payment-files': cleanupOldPaymentFiles,
  './workers/mark-overpayments': markOverpayments,
  './workers/send-feedback': sendFeedback,
  './workers/cleanup-old-data': cleanupOldData,
  './workers/send-technical-help': sendTechnicalHelp,
  './workers/archive-old-claims': archiveOldClaims,
  './workers/archive-claim': archiveClaim,
  './workers/reference-recovery': referenceRecovery,
  './workers/generate-payout-payments': generatePayoutPayments,
  './workers/generate-direct-payments': generateDirectPayments,
  './workers/send-malware-notification': sendMalwareAlert
})

describe('services/getWorkerForTask', function () {
  it('should return send-accepted-claim-notification', function () {
    const worker = getWorkerForTask(tasksEnum.ACCEPT_CLAIM_NOTIFICATION)
    expect(worker.name).to.be.equal('sendAcceptedClaimNotification')
  })

  it('should return send-rejected-claim-notification', function () {
    const worker = getWorkerForTask(tasksEnum.REJECT_CLAIM_NOTIFICATION)
    expect(worker.name).to.be.equal('sendRejectedClaimNotification')
  })

  it('should return send-request-information-claim-notification', function () {
    const worker = getWorkerForTask(tasksEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION)
    expect(worker.name).to.be.equal('sendRequestInformationClaimNotification')
  })

  it('should return send-request-information-response-submitted-notification', function () {
    const worker = getWorkerForTask(tasksEnum.REQUEST_INFORMATION_RESPONSE_SUBMITTED_NOTIFICATION)
    expect(worker.name).to.be.equal('sendRequestInformationResponseSubmittedNotification')
  })

  it('should return send-advance-claim-evidence-reminder-notification', function () {
    const worker = getWorkerForTask(tasksEnum.ADVANCE_CLAIM_EVIDENCE_REMINDER_NOTIFICATION)
    expect(worker.name).to.be.equal('sendAdvanceClaimEvidenceReminderNotification')
  })

  it('should return send-updated-contact-details-claim-notification', function () {
    const worker = getWorkerForTask(tasksEnum.UPDATED_CONTACT_DETAILS_CLAIM_NOTIFICATION)
    expect(worker.name).to.be.equal('sendUpdatedContactDetailsClaimNotification')
  })

  it('should return send-claim-notification', function () {
    const worker = getWorkerForTask(tasksEnum.SEND_CLAIM_NOTIFICATION)
    expect(worker.name).to.be.equal('sendClaimNotification')
  })

  it('should return complete-claim', function () {
    const worker = getWorkerForTask(tasksEnum.COMPLETE_CLAIM)
    expect(worker.name).to.be.equal('completeClaim')
  })

  it('should return request-information-response', function () {
    const worker = getWorkerForTask(tasksEnum.REQUEST_INFORMATION_RESPONSE)
    expect(worker.name).to.be.equal('requestInformationResponse')
  })

  it('should return dwp-check', function () {
    const worker = getWorkerForTask(tasksEnum.DWP_CHECK)
    expect(worker.name).to.be.equal('dwpCheck')
  })

  it('should return send-feedback', function () {
    const worker = getWorkerForTask(tasksEnum.FEEDBACK_SUBMITTED)
    expect(worker.name).to.be.equal('sendFeedback')
  })

  it('should return send-technical-help', function () {
    const worker = getWorkerForTask(tasksEnum.TECHNICAL_HELP_SUBMITTED)
    expect(worker.name).to.be.equal('sendTechnicalHelp')
  })

  it('should return archive-old-claims', function () {
    const worker = getWorkerForTask(tasksEnum.ARCHIVE_OLD_CLAIMS)
    expect(worker.name).to.be.equal('archiveOldClaims')
  })

  it('should return archive-claim', function () {
    const worker = getWorkerForTask(tasksEnum.ARCHIVE_CLAIM)
    expect(worker.name).to.be.equal('archiveClaim')
  })

  it('should return reference-recovery', function () {
    const worker = getWorkerForTask(tasksEnum.REFERENCE_RECOVERY)
    expect(worker.name).to.be.equal('referenceRecovery')
  })

  it('should return send-malware-alert', function () {
    const worker = getWorkerForTask(tasksEnum.SEND_MALWARE_ALERT)
    expect(worker.name).to.be.equal('sendMalwareAlert')
  })

  it('should return null if none found', function () {
    const worker = getWorkerForTask('')
    expect(worker).to.be.equal(null)
  })
})
