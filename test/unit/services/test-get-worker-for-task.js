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
const cleanupOldData = { name: 'cleanupOldData' }
const sendTechnicalHelp = { name: 'sendTechnicalHelp' }
const archiveOldClaims = { name: 'archiveOldClaims' }
const archiveClaim = { name: 'archiveClaim' }
const referenceRecovery = { name: 'referenceRecovery' }
const generateDirectPayments = { name: 'generateDirectPayments' }
const sendMalwareAlert = { name: 'sendMalwareAlert' }

jest.mock(
  './workers/send-accepted-claim-notification',
  () => sendAcceptedClaimNotification
);

jest.mock(
  './workers/send-rejected-claim-notification',
  () => sendRejectedClaimNotification
);

jest.mock(
  './workers/send-request-information-claim-notification',
  () => sendRequestInformationClaimNotification
);

jest.mock(
  './workers/send-request-information-response-submitted-notification',
  () => sendRequestInformationResponseSubmittedNotification
);

jest.mock(
  './workers/send-advance-claim-evidence-reminder-notification',
  () => sendAdvanceClaimEvidenceReminderNotification
);

jest.mock(
  './workers/send-updated-contact-details-claim-notification',
  () => sendUpdatedContactDetailsClaimNotification
);

jest.mock('./workers/send-claim-notification', () => sendClaimNotification);
jest.mock('./workers/complete-claim', () => completeClaim);
jest.mock('./workers/request-information-response', () => requestInformationResponse);
jest.mock('./workers/dwp-check', () => dwpCheck);

jest.mock(
  './workers/send-all-advance-claim-reminders-for-day',
  () => sendAllAdvanceClaimRemindersForDay
);

jest.mock('./workers/cleanup-old-payment-files', () => cleanupOldPaymentFiles);
jest.mock('./workers/mark-overpayments', () => markOverpayments);
jest.mock('./workers/cleanup-old-data', () => cleanupOldData);
jest.mock('./workers/send-technical-help', () => sendTechnicalHelp);
jest.mock('./workers/archive-old-claims', () => archiveOldClaims);
jest.mock('./workers/archive-claim', () => archiveClaim);
jest.mock('./workers/reference-recovery', () => referenceRecovery);
jest.mock('./workers/generate-direct-payments', () => generateDirectPayments);
jest.mock('./workers/send-malware-notification', () => sendMalwareAlert);

const getWorkerForTask = require('../../../app/services/get-worker-for-task')

describe('services/getWorkerForTask', function () {
  it('should return send-accepted-claim-notification', function () {
    const worker = getWorkerForTask(tasksEnum.ACCEPT_CLAIM_NOTIFICATION)
    expect(worker.name).toBe('sendAcceptedClaimNotification')
  })

  it('should return send-rejected-claim-notification', function () {
    const worker = getWorkerForTask(tasksEnum.REJECT_CLAIM_NOTIFICATION)
    expect(worker.name).toBe('sendRejectedClaimNotification')
  })

  it('should return send-request-information-claim-notification', function () {
    const worker = getWorkerForTask(tasksEnum.REQUEST_INFORMATION_CLAIM_NOTIFICATION)
    expect(worker.name).toBe('sendRequestInformationClaimNotification')
  })

  it('should return send-request-information-response-submitted-notification', function () {
    const worker = getWorkerForTask(tasksEnum.REQUEST_INFORMATION_RESPONSE_SUBMITTED_NOTIFICATION)
    expect(worker.name).toBe('sendRequestInformationResponseSubmittedNotification')
  })

  it('should return send-advance-claim-evidence-reminder-notification', function () {
    const worker = getWorkerForTask(tasksEnum.ADVANCE_CLAIM_EVIDENCE_REMINDER_NOTIFICATION)
    expect(worker.name).toBe('sendAdvanceClaimEvidenceReminderNotification')
  })

  it('should return send-updated-contact-details-claim-notification', function () {
    const worker = getWorkerForTask(tasksEnum.UPDATED_CONTACT_DETAILS_CLAIM_NOTIFICATION)
    expect(worker.name).toBe('sendUpdatedContactDetailsClaimNotification')
  })

  it('should return send-claim-notification', function () {
    const worker = getWorkerForTask(tasksEnum.SEND_CLAIM_NOTIFICATION)
    expect(worker.name).toBe('sendClaimNotification')
  })

  it('should return complete-claim', function () {
    const worker = getWorkerForTask(tasksEnum.COMPLETE_CLAIM)
    expect(worker.name).toBe('completeClaim')
  })

  it('should return request-information-response', function () {
    const worker = getWorkerForTask(tasksEnum.REQUEST_INFORMATION_RESPONSE)
    expect(worker.name).toBe('requestInformationResponse')
  })

  it('should return dwp-check', function () {
    const worker = getWorkerForTask(tasksEnum.DWP_CHECK)
    expect(worker.name).toBe('dwpCheck')
  })

  it('should return send-technical-help', function () {
    const worker = getWorkerForTask(tasksEnum.TECHNICAL_HELP_SUBMITTED)
    expect(worker.name).toBe('sendTechnicalHelp')
  })

  it('should return archive-old-claims', function () {
    const worker = getWorkerForTask(tasksEnum.ARCHIVE_OLD_CLAIMS)
    expect(worker.name).toBe('archiveOldClaims')
  })

  it('should return archive-claim', function () {
    const worker = getWorkerForTask(tasksEnum.ARCHIVE_CLAIM)
    expect(worker.name).toBe('archiveClaim')
  })

  it('should return reference-recovery', function () {
    const worker = getWorkerForTask(tasksEnum.REFERENCE_RECOVERY)
    expect(worker.name).toBe('referenceRecovery')
  })

  it('should return send-malware-alert', function () {
    const worker = getWorkerForTask(tasksEnum.SEND_MALWARE_ALERT)
    expect(worker.name).toBe('sendMalwareAlert')
  })

  it('should return null if none found', function () {
    const worker = getWorkerForTask('')
    expect(worker).toBeNull()
  })
})
