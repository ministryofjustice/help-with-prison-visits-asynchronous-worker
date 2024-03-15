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

let mockMoveClaimDocumentsToInternal
let mockGetAllClaimData
let mockUpdateClaimStatus
let mockInsertClaimEvent
let mockGenerateClaimUpdatedString
let mockAutoApprovalProcess
let mockUpdateBankDetails
let mockGetVisitorEmailAddress
let mockInsertTask
let mockTransactionHelper

let requestInformationResponse

jest.mock(
  '../../../../app/services/data/move-claim-documents-to-internal',
  () => mockMoveClaimDocumentsToInternal
)

jest.mock('../../../../app/services/data/get-all-claim-data', () => mockGetAllClaimData)
jest.mock('../../../../app/services/data/update-claim-status', () => mockUpdateClaimStatus)
jest.mock('../../../../app/services/data/insert-claim-event', () => mockInsertClaimEvent)

jest.mock(
  '../../../../app/services/notify/helpers/generate-claim-updated-string',
  () => mockGenerateClaimUpdatedString
)

jest.mock('../../../../app/services/auto-approval/auto-approval-process', () => mockAutoApprovalProcess)
jest.mock('../../../../app/services/data/update-bank-details', () => mockUpdateBankDetails)
jest.mock('../../../../app/services/data/get-visitor-email-address', () => mockGetVisitorEmailAddress)
jest.mock('../../../../app/services/data/insert-task', () => mockInsertTask)
jest.mock('../../../../app/services/workers/helpers/transaction-helper', () => mockTransactionHelper)

describe('services/workers/request-information-response', function () {
  beforeEach(function () {
    mockMoveClaimDocumentsToInternal = jest.fn().mockResolvedValue(SINGLE_UPLOADED_DOCUMENT)
    mockGetAllClaimData = jest.fn().mockResolvedValue(CLAIM_DATA_FOR_UNREVIEWED_CLAIM)
    mockUpdateClaimStatus = jest.fn().mockResolvedValue()
    mockInsertClaimEvent = jest.fn().mockResolvedValue()
    mockGenerateClaimUpdatedString = jest.fn().mockReturnValue('message')
    mockAutoApprovalProcess = jest.fn().mockResolvedValue()
    mockUpdateBankDetails = jest.fn().mockResolvedValue()
    mockGetVisitorEmailAddress = jest.fn().mockResolvedValue(EMAIL_ADDRESS)
    mockInsertTask = jest.fn().mockResolvedValue()
    mockTransactionHelper = jest.fn().mockResolvedValue()

    requestInformationResponse = require('../../../../app/services/workers/request-information-response')
  })

  it('should call data methods to move claim documents, update status and trigger auto-approval, no bank details methods and add a note claim event', function () {
    mockMoveClaimDocumentsToInternal.mockResolvedValue()
    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId,
      additionalData: ADDITIONAL_DATA
    }).then(function () {
      expect(mockMoveClaimDocumentsToInternal).toHaveBeenCalledWith(reference, eligibilityId, claimId) //eslint-disable-line
      expect(mockGetAllClaimData).toHaveBeenCalledWith('IntSchema', reference, eligibilityId, claimId) //eslint-disable-line
      expect(mockUpdateClaimStatus).toHaveBeenCalledWith(claimId, 'NEW') //eslint-disable-line
      // should have inserted event for just the note, no document
      expect(mockInsertClaimEvent).toHaveBeenCalledTimes(1) //eslint-disable-line
      expect(mockAutoApprovalProcess).toHaveBeenCalledWith(reference, eligibilityId, claimId) //eslint-disable-line
      expect(mockUpdateBankDetails).not.toHaveBeenCalled() //eslint-disable-line
      expect(mockTransactionHelper).not.toHaveBeenCalled() //eslint-disable-line
    })
  })

  it('should call data methods to move claim documents, but not insert event as no documents, update status and trigger auto-approval, no bank details methods and add a note claim event', function () {
    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId,
      additionalData: ADDITIONAL_DATA
    }).then(function () {
      expect(mockMoveClaimDocumentsToInternal).toHaveBeenCalledWith(reference, eligibilityId, claimId) //eslint-disable-line
      expect(mockGetAllClaimData).toHaveBeenCalledWith('IntSchema', reference, eligibilityId, claimId) //eslint-disable-line
      expect(mockUpdateClaimStatus).toHaveBeenCalledWith(claimId, 'NEW') //eslint-disable-line
      expect(mockGenerateClaimUpdatedString).toHaveBeenCalledTimes(1) //eslint-disable-line
      // should have inserted event for note and update
      expect(mockInsertClaimEvent).toHaveBeenCalledTimes(2) //eslint-disable-line
      expect(mockAutoApprovalProcess).toHaveBeenCalledWith(reference, eligibilityId, claimId) //eslint-disable-line
      expect(mockUpdateBankDetails).not.toHaveBeenCalled() //eslint-disable-line
      expect(mockTransactionHelper).not.toHaveBeenCalled() //eslint-disable-line
    })
  })

  it('should call data methods to move claim documents, update status and trigger auto-approval, no bank details methods and add no note claim event', function () {
    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId
    }).then(function () {
      expect(mockMoveClaimDocumentsToInternal).toHaveBeenCalledWith(reference, eligibilityId, claimId) //eslint-disable-line
      expect(mockGetAllClaimData).toHaveBeenCalledWith('IntSchema', reference, eligibilityId, claimId) //eslint-disable-line
      expect(mockUpdateClaimStatus).toHaveBeenCalledWith(claimId, 'NEW') //eslint-disable-line
      expect(mockGenerateClaimUpdatedString).toHaveBeenCalledTimes(1) //eslint-disable-line
      expect(mockInsertClaimEvent).toHaveBeenCalledTimes(1) //eslint-disable-line
      expect(mockAutoApprovalProcess).toHaveBeenCalledWith(reference, eligibilityId, claimId) //eslint-disable-line
      expect(mockUpdateBankDetails).not.toHaveBeenCalled() //eslint-disable-line
      expect(mockTransactionHelper).not.toHaveBeenCalled() //eslint-disable-line
    })
  })

  it('should insert task to send notification', function () {
    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId,
      additionalData: ADDITIONAL_DATA
    }).then(function () {
      expect(mockGetVisitorEmailAddress).toHaveBeenCalledWith('IntSchema', reference, eligibilityId) //eslint-disable-line
      expect(mockInsertTask).toHaveBeenCalledWith(reference, eligibilityId, claimId, tasksEnum.REQUEST_INFORMATION_RESPONSE_SUBMITTED_NOTIFICATION, EMAIL_ADDRESS) //eslint-disable-line
    })
  })

  it('should not trigger auto-approval for previously reviewed claims', function () {
    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA_FOR_REVIEWED_CLAIM)

    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId
    }).then(function () {
      expect(mockAutoApprovalProcess).not.toHaveBeenCalled() //eslint-disable-line
    })
  })

  it('should call bank details methods', function () {
    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA_FOR_BANK_DETAILS)
    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId
    }).then(function () {
      expect(mockGetAllClaimData).toHaveBeenCalledWith('ExtSchema', reference, eligibilityId, claimId) //eslint-disable-line
      expect(mockUpdateBankDetails).toHaveBeenCalled() //eslint-disable-line
      expect(mockUpdateBankDetails).toHaveBeenCalledWith(BANK_DETAILS.ClaimBankDetailId, reference, claimId, BANK_DETAILS.SortCode, BANK_DETAILS.AccountNumber) //eslint-disable-line
      expect(mockInsertClaimEvent).toHaveBeenCalledWith(reference, eligibilityId, claimId, null, claimEventEnum.BANK_DETAILS_UPDATED.value, null, null, true)
      expect(mockTransactionHelper).toHaveBeenCalledWith(eligibilityId, claimId) //eslint-disable-line
    })
  })

  it('should not call bank details methods', function () {
    mockGetAllClaimData.mockResolvedValue(CLAIM_DATA_FOR_PAYOUT)
    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId
    }).then(function () {
      expect(mockGetAllClaimData).toHaveBeenCalledWith('IntSchema', reference, eligibilityId, claimId) //eslint-disable-line
      expect(mockUpdateBankDetails).not.toHaveBeenCalled() //eslint-disable-line
    })
  })
})
