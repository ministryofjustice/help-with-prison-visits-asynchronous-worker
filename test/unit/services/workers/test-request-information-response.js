const tasksEnum = require('../../../../app/constants/tasks-enum')
const claimEventEnum = require('../../../../app/constants/claim-event-enum')

const dateFormatter = require('../../../../app/services/date-formatter')

const reference = '1234567'
const eligibilityId = '1234'
const claimId = 123

const ADDITIONAL_DATA = 'Message from claimant'
const CLAIM_DATA_FOR_UNREVIEWED_CLAIM = { Claim: { DateReviewed: null }, ClaimBankDetail: {} }
const CLAIM_DATA_FOR_REVIEWED_CLAIM = { Claim: { DateReviewed: dateFormatter.now().toDate() }, ClaimBankDetail: {} }
const BANK_DETAILS = { ClaimBankDetailId: 1, SortCode: '123456', AccountNumber: '12345678' }
const CLAIM_DATA_FOR_BANK_DETAILS = { Claim: { PaymentMethod: 'bank', DateReviewed: null, Status: 'REQUEST-INFO-PAYMENT' }, ClaimBankDetail: BANK_DETAILS }
const CLAIM_DATA_FOR_PAYOUT = { Claim: { PaymentMethod: 'payout' } }
const SINGLE_UPLOADED_DOCUMENT = [{ ClaimDocumentId: 1, DocumentType: 'VISIT-CONFIRMATION', DocumentStatus: 'uploaded' }]
const EMAIL_ADDRESS = 'test@test.com'

let moveClaimDocumentsToInternal
let getAllClaimData
let updateClaimStatus
let insertClaimEvent
let generateClaimUpdatedString
let autoApprovalProcess
let updateBankDetails
let getVisitorEmailAddress
let insertTask
let transactionHelper

let requestInformationResponse

jest.mock(
  '../data/move-claim-documents-to-internal',
  () => moveClaimDocumentsToInternal
)

jest.mock('../data/get-all-claim-data', () => getAllClaimData)
jest.mock('../data/update-claim-status', () => updateClaimStatus)
jest.mock('../data/insert-claim-event', () => insertClaimEvent)

jest.mock(
  '../notify/helpers/generate-claim-updated-string',
  () => generateClaimUpdatedString
)

jest.mock('../auto-approval/auto-approval-process', () => autoApprovalProcess)
jest.mock('../data/update-bank-details', () => updateBankDetails)
jest.mock('../data/get-visitor-email-address', () => getVisitorEmailAddress)
jest.mock('../data/insert-task', () => insertTask)
jest.mock('./helpers/transaction-helper', () => transactionHelper)

describe('services/workers/request-information-response', function () {
  beforeEach(function () {
    moveClaimDocumentsToInternal = jest.fn().mockResolvedValue(SINGLE_UPLOADED_DOCUMENT)
    getAllClaimData = jest.fn().mockResolvedValue(CLAIM_DATA_FOR_UNREVIEWED_CLAIM)
    updateClaimStatus = jest.fn().mockResolvedValue()
    insertClaimEvent = jest.fn().mockResolvedValue()
    generateClaimUpdatedString = jest.fn().mockReturnValue('message')
    autoApprovalProcess = jest.fn().mockResolvedValue()
    updateBankDetails = jest.fn().mockResolvedValue()
    getVisitorEmailAddress = jest.fn().mockResolvedValue(EMAIL_ADDRESS)
    insertTask = jest.fn().mockResolvedValue()
    transactionHelper = jest.fn().mockResolvedValue()

    requestInformationResponse = require('../../../../app/services/workers/request-information-response')
  })

  it('should call data methods to move claim documents, update status and trigger auto-approval, no bank details methods and add a note claim event', function () {
    moveClaimDocumentsToInternal.resolves()
    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId,
      additionalData: ADDITIONAL_DATA
    }).then(function () {
      expect(moveClaimDocumentsToInternal.calledWith(reference, eligibilityId, claimId)).toBe(true) //eslint-disable-line
      expect(getAllClaimData.calledWith('IntSchema', reference, eligibilityId, claimId)).toBe(true) //eslint-disable-line
      expect(updateClaimStatus.calledWith(claimId, 'NEW')).toBe(true) //eslint-disable-line
      // should have inserted event for just the note, no document
      expect(insertClaimEvent.calledOnce).toBe(true) //eslint-disable-line
      expect(autoApprovalProcess.calledWith(reference, eligibilityId, claimId)).toBe(true) //eslint-disable-line
      expect(updateBankDetails.called).toBe(false) //eslint-disable-line
      expect(transactionHelper.called).toBe(false) //eslint-disable-line
    })
  })

  it('should call data methods to move claim documents, but not insert event as no documents, update status and trigger auto-approval, no bank details methods and add a note claim event', function () {
    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId,
      additionalData: ADDITIONAL_DATA
    }).then(function () {
      expect(moveClaimDocumentsToInternal.calledWith(reference, eligibilityId, claimId)).toBe(true) //eslint-disable-line
      expect(getAllClaimData.calledWith('IntSchema', reference, eligibilityId, claimId)).toBe(true) //eslint-disable-line
      expect(updateClaimStatus.calledWith(claimId, 'NEW')).toBe(true) //eslint-disable-line
      expect(generateClaimUpdatedString.calledOnce).toBe(true) //eslint-disable-line
      // should have inserted event for note and update
      expect(insertClaimEvent.calledTwice).toBe(true) //eslint-disable-line
      expect(autoApprovalProcess.calledWith(reference, eligibilityId, claimId)).toBe(true) //eslint-disable-line
      expect(updateBankDetails.called).toBe(false) //eslint-disable-line
      expect(transactionHelper.called).toBe(false) //eslint-disable-line
    })
  })

  it('should call data methods to move claim documents, update status and trigger auto-approval, no bank details methods and add no note claim event', function () {
    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId
    }).then(function () {
      expect(moveClaimDocumentsToInternal.calledWith(reference, eligibilityId, claimId)).toBe(true) //eslint-disable-line
      expect(getAllClaimData.calledWith('IntSchema', reference, eligibilityId, claimId)).toBe(true) //eslint-disable-line
      expect(updateClaimStatus.calledWith(claimId, 'NEW')).toBe(true) //eslint-disable-line
      expect(generateClaimUpdatedString.calledOnce).toBe(true) //eslint-disable-line
      expect(insertClaimEvent.calledOnce).toBe(true) //eslint-disable-line
      expect(autoApprovalProcess.calledWith(reference, eligibilityId, claimId)).toBe(true) //eslint-disable-line
      expect(updateBankDetails.called).toBe(false) //eslint-disable-line
      expect(transactionHelper.called).toBe(false) //eslint-disable-line
    })
  })

  it('should insert task to send notification', function () {
    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId,
      additionalData: ADDITIONAL_DATA
    }).then(function () {
      expect(getVisitorEmailAddress.calledWith('IntSchema', reference, eligibilityId)).toBe(true) //eslint-disable-line
      expect(insertTask.calledWith(reference, eligibilityId, claimId, tasksEnum.REQUEST_INFORMATION_RESPONSE_SUBMITTED_NOTIFICATION, EMAIL_ADDRESS)).toBe(true) //eslint-disable-line
    })
  })

  it('should not trigger auto-approval for previously reviewed claims', function () {
    getAllClaimData.resolves(CLAIM_DATA_FOR_REVIEWED_CLAIM)

    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId
    }).then(function () {
      expect(autoApprovalProcess.called).toBe(false) //eslint-disable-line
    })
  })

  it('should call bank details methods', function () {
    getAllClaimData.resolves(CLAIM_DATA_FOR_BANK_DETAILS)
    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId
    }).then(function () {
      expect(getAllClaimData.calledWith('ExtSchema', reference, eligibilityId, claimId)).toBe(true) //eslint-disable-line
      expect(updateBankDetails.called).toBe(true) //eslint-disable-line
      expect(updateBankDetails.calledWith(BANK_DETAILS.ClaimBankDetailId, reference, claimId, BANK_DETAILS.SortCode, BANK_DETAILS.AccountNumber)).toBe(true) //eslint-disable-line
      expect(insertClaimEvent.calledWith(reference, eligibilityId, claimId, null, claimEventEnum.BANK_DETAILS_UPDATED.value, null, null, true))
      expect(transactionHelper.calledWith(eligibilityId, claimId)).toBe(true) //eslint-disable-line
    })
  })

  it('should not call bank details methods', function () {
    getAllClaimData.resolves(CLAIM_DATA_FOR_PAYOUT)
    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId
    }).then(function () {
      expect(getAllClaimData.calledWith('IntSchema', reference, eligibilityId, claimId)).toBe(true) //eslint-disable-line
      expect(updateBankDetails.called).toBe(false) //eslint-disable-line
    })
  })
})
