const expect = require('chai').expect
const proxyquire = require('proxyquire')
const tasksEnum = require('../../../app/constants/tasks-enum')

const sendAcceptedClaimNotification = { name: 'sendAcceptedClaimNotification' }
const sendRejectedClaimNotification = { name: 'sendRejectedClaimNotification' }
const sendRequestInformationClaimNotification = { name: 'sendRequestInformationClaimNotification' }
const sendRequestInformationResponseSubmittedNotification = { name: 'sendRequestInformationResponseSubmittedNotification' }
const sendAdvanceClaimEvidenceReminderNotification = { name: 'sendAdvanceClaimEvidenceReminderNotification' }
const sendClaimNotification = { name: 'sendClaimNotification' }
const completeClaim = { name: 'completeClaim' }
const requestInformationResponse = { name: 'requestInformationResponse' }
const dwpCheck = { name: 'dwpCheck' }
const sendPerformancePlatformMetricsForDay = { name: 'sendPerformancePlatformMetricsForDay' }
const sendAllAdvanceClaimRemindersForDay = { name: 'sendAllAdvanceClaimRemindersForDay' }
const cleanupOldPaymentFiles = { name: 'cleanupOldPaymentFiles' }
const markOverpayments = {name: 'markOverpayments'}
const sendFeedback = {name: 'sendFeedback'}
const cleanupOldData = {name: 'cleanupOldData'}
const sendTechnicalHelp = {name: 'sendTechnicalHelp'}
const archiveOldClaims = {name: 'archiveOldClaims'}
const archiveClaim = {name: 'archiveClaim'}
const referenceRecovery = {name: 'referenceRecovery'}

const getWorkerForTask = proxyquire('../../../app/services/get-worker-for-task', {
  './workers/send-accepted-claim-notification': sendAcceptedClaimNotification,
  './workers/send-rejected-claim-notification': sendRejectedClaimNotification,
  './workers/send-request-information-claim-notification': sendRequestInformationClaimNotification,
  './workers/send-request-information-response-submitted-notification': sendRequestInformationResponseSubmittedNotification,
  './workers/send-advance-claim-evidence-reminder-notification': sendAdvanceClaimEvidenceReminderNotification,
  './workers/send-claim-notification': sendClaimNotification,
  './workers/complete-claim': completeClaim,
  './workers/request-information-response': requestInformationResponse,
  './workers/dwp-check': dwpCheck,
  './workers/send-performance-platform-metrics-for-day': sendPerformancePlatformMetricsForDay,
  './workers/send-all-advance-claim-reminders-for-day': sendAllAdvanceClaimRemindersForDay,
  './workers/cleanup-old-payment-files': cleanupOldPaymentFiles,
  './workers/mark-overpayments': markOverpayments,
  './workers/send-feedback': sendFeedback,
  './workers/cleanup-old-data': cleanupOldData,
  './workers/send-technical-help': sendTechnicalHelp,
  './workers/archive-old-claims': archiveOldClaims,
  './workers/archive-claim': archiveClaim,
  './workers/reference-recovery': referenceRecovery
})

describe('services/getWorkerForTask', function () {
  it('should return send-accepted-claim-notification', function () {
    var worker = getWorkerForTask(tasksEnum.ACCEPT_CLAIM_NOTIFICATION)
    expect(worker.name).to.be.equal('sendAcceptedClaimNotification')
  })

  it('should return send-rejected-claim-notification', function () {
    var worker = getWorkerForTask(tasksEnum.REJECT_CLAIM_NOTIFICATION)
    expect(worker.name).to.be.equal('sendRejectedClaimNotification')
  })

  it('should return send-request-information-claim-notification', function () {
    var worker = getWorkerForTask(tasksEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION)
    expect(worker.name).to.be.equal('sendRequestInformationClaimNotification')
  })

  it('should return send-request-information-response-submitted-notification', function () {
    var worker = getWorkerForTask(tasksEnum.REQUEST_INFORMATION_RESPONSE_SUBMITTED_NOTIFICATION)
    expect(worker.name).to.be.equal('sendRequestInformationResponseSubmittedNotification')
  })

  it('should return send-advance-claim-evidence-reminder-notification', function () {
    var worker = getWorkerForTask(tasksEnum.ADVANCE_CLAIM_EVIDENCE_REMINDER_NOTIFICATION)
    expect(worker.name).to.be.equal('sendAdvanceClaimEvidenceReminderNotification')
  })

  it('should return send-claim-notification', function () {
    var worker = getWorkerForTask(tasksEnum.SEND_CLAIM_NOTIFICATION)
    expect(worker.name).to.be.equal('sendClaimNotification')
  })

  it('should return complete-claim', function () {
    var worker = getWorkerForTask(tasksEnum.COMPLETE_CLAIM)
    expect(worker.name).to.be.equal('completeClaim')
  })

  it('should return request-information-response', function () {
    var worker = getWorkerForTask(tasksEnum.REQUEST_INFORMATION_RESPONSE)
    expect(worker.name).to.be.equal('requestInformationResponse')
  })

  it('should return dwp-check', function () {
    var worker = getWorkerForTask(tasksEnum.DWP_CHECK)
    expect(worker.name).to.be.equal('dwpCheck')
  })

  it('should return send-performance-platform-metrics-for-day', function () {
    var worker = getWorkerForTask(tasksEnum.SEND_PERFORMANCE_PLATFORM_METRICS_FOR_DAY)
    expect(worker.name).to.be.equal('sendPerformancePlatformMetricsForDay')
  })

  it('should return send-all-advance-claim-reminders-for-day', function () {
    var worker = getWorkerForTask(tasksEnum.SEND_ALL_ADVANCE_CLAIM_REMINDERS_FOR_DAY)
    expect(worker.name).to.be.equal('sendAllAdvanceClaimRemindersForDay')
  })

  it('should return cleanup-old-payment-files', function () {
    var worker = getWorkerForTask(tasksEnum.CLEANUP_OLD_PAYMENT_FILES)
    expect(worker.name).to.be.equal('cleanupOldPaymentFiles')
  })

  it('should return mark-overpayments', function () {
    var worker = getWorkerForTask(tasksEnum.MARK_ALL_OVERPAYMENTS)
    expect(worker.name).to.be.equal('markOverpayments')
  })

  it('should return send-feedback', function () {
    var worker = getWorkerForTask(tasksEnum.FEEDBACK_SUBMITTED)
    expect(worker.name).to.be.equal('sendFeedback')
  })

  it('should return cleanup-old-data', function () {
    var worker = getWorkerForTask(tasksEnum.CLEANUP_OLD_DATA)
    expect(worker.name).to.be.equal('cleanupOldData')
  })

  it('should return send-technical-help', function () {
    var worker = getWorkerForTask(tasksEnum.TECHNICAL_HELP_SUBMITTED)
    expect(worker.name).to.be.equal('sendTechnicalHelp')
  })

  it('should return archive-old-claims', function () {
    var worker = getWorkerForTask(tasksEnum.ARCHIVE_OLD_CLAIMS)
    expect(worker.name).to.be.equal('archiveOldClaims')
  })

  it('should return archive-claim', function () {
    var worker = getWorkerForTask(tasksEnum.ARCHIVE_CLAIM)
    expect(worker.name).to.be.equal('archiveClaim')
  })

  it('should return reference-recovery', function () {
    var worker = getWorkerForTask(tasksEnum.REFERENCE_RECOVERY)
    expect(worker.name).to.be.equal('referenceRecovery')
  })
})
