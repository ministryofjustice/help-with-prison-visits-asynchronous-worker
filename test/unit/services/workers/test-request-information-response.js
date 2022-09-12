const tasksEnum = require('../../../../app/constants/tasks-enum')
const claimEventEnum = require('../../../../app/constants/claim-event-enum')
const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')

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

describe('services/workers/request-information-response', function () {
  beforeEach(function () {
    moveClaimDocumentsToInternal = sinon.stub().resolves(SINGLE_UPLOADED_DOCUMENT)
    getAllClaimData = sinon.stub().resolves(CLAIM_DATA_FOR_UNREVIEWED_CLAIM)
    updateClaimStatus = sinon.stub().resolves()
    insertClaimEvent = sinon.stub().resolves()
    generateClaimUpdatedString = sinon.stub().returns('message')
    autoApprovalProcess = sinon.stub().resolves()
    updateBankDetails = sinon.stub().resolves()
    getVisitorEmailAddress = sinon.stub().resolves(EMAIL_ADDRESS)
    insertTask = sinon.stub().resolves()
    transactionHelper = sinon.stub().resolves()

    requestInformationResponse = proxyquire('../../../../app/services/workers/request-information-response', {
      '../data/move-claim-documents-to-internal': moveClaimDocumentsToInternal,
      '../data/get-all-claim-data': getAllClaimData,
      '../data/update-claim-status': updateClaimStatus,
      '../data/insert-claim-event': insertClaimEvent,
      '../notify/helpers/generate-claim-updated-string': generateClaimUpdatedString,
      '../auto-approval/auto-approval-process': autoApprovalProcess,
      '../data/update-bank-details': updateBankDetails,
      '../data/get-visitor-email-address': getVisitorEmailAddress,
      '../data/insert-task': insertTask,
      './helpers/transaction-helper': transactionHelper
    })
  })

  it('should call data methods to move claim documents, update status and trigger auto-approval, no bank details methods and add a note claim event', function () {
    moveClaimDocumentsToInternal.resolves()
    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId,
      additionalData: ADDITIONAL_DATA
    }).then(function () {
      expect(moveClaimDocumentsToInternal.calledWith(reference, eligibilityId, claimId)).to.be.true //eslint-disable-line
      expect(getAllClaimData.calledWith('IntSchema', reference, eligibilityId, claimId)).to.be.true //eslint-disable-line
      expect(updateClaimStatus.calledWith(claimId, 'NEW')).to.be.true //eslint-disable-line
      expect(insertClaimEvent.calledOnce, 'should have inserted event for just the note, no document').to.be.true //eslint-disable-line
      expect(autoApprovalProcess.calledWith(reference, eligibilityId, claimId)).to.be.true //eslint-disable-line
      expect(updateBankDetails.called).to.be.false //eslint-disable-line
      expect(transactionHelper.called).to.be.false //eslint-disable-line
    })
  })

  it('should call data methods to move claim documents, but not insert event as no documents, update status and trigger auto-approval, no bank details methods and add a note claim event', function () {
    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId,
      additionalData: ADDITIONAL_DATA
    }).then(function () {
      expect(moveClaimDocumentsToInternal.calledWith(reference, eligibilityId, claimId)).to.be.true //eslint-disable-line
      expect(getAllClaimData.calledWith('IntSchema', reference, eligibilityId, claimId)).to.be.true //eslint-disable-line
      expect(updateClaimStatus.calledWith(claimId, 'NEW')).to.be.true //eslint-disable-line
      expect(generateClaimUpdatedString.calledOnce).to.be.true //eslint-disable-line
      expect(insertClaimEvent.calledTwice, 'should have inserted event for note and update').to.be.true //eslint-disable-line
      expect(autoApprovalProcess.calledWith(reference, eligibilityId, claimId)).to.be.true //eslint-disable-line
      expect(updateBankDetails.called).to.be.false //eslint-disable-line
      expect(transactionHelper.called).to.be.false //eslint-disable-line
    })
  })

  it('should call data methods to move claim documents, update status and trigger auto-approval, no bank details methods and add no note claim event', function () {
    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId
    }).then(function () {
      expect(moveClaimDocumentsToInternal.calledWith(reference, eligibilityId, claimId)).to.be.true //eslint-disable-line
      expect(getAllClaimData.calledWith('IntSchema', reference, eligibilityId, claimId)).to.be.true //eslint-disable-line
      expect(updateClaimStatus.calledWith(claimId, 'NEW')).to.be.true //eslint-disable-line
      expect(generateClaimUpdatedString.calledOnce).to.be.true //eslint-disable-line
      expect(insertClaimEvent.calledOnce).to.be.true //eslint-disable-line
      expect(autoApprovalProcess.calledWith(reference, eligibilityId, claimId)).to.be.true //eslint-disable-line
      expect(updateBankDetails.called).to.be.false //eslint-disable-line
      expect(transactionHelper.called).to.be.false //eslint-disable-line
    })
  })

  it('should insert task to send notification', function () {
    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId,
      additionalData: ADDITIONAL_DATA
    }).then(function () {
      expect(getVisitorEmailAddress.calledWith('IntSchema', reference, eligibilityId)).to.be.true //eslint-disable-line
      expect(insertTask.calledWith(reference, eligibilityId, claimId, tasksEnum.REQUEST_INFORMATION_RESPONSE_SUBMITTED_NOTIFICATION, EMAIL_ADDRESS)).to.be.true //eslint-disable-line
    })
  })

  it('should not trigger auto-approval for previously reviewed claims', function () {
    getAllClaimData.resolves(CLAIM_DATA_FOR_REVIEWED_CLAIM)

    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId
    }).then(function () {
      expect(autoApprovalProcess.called).to.be.false //eslint-disable-line
    })
  })

  it('should call bank details methods', function () {
    getAllClaimData.resolves(CLAIM_DATA_FOR_BANK_DETAILS)
    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId
    }).then(function () {
      expect(getAllClaimData.calledWith('ExtSchema', reference, eligibilityId, claimId)).to.be.true //eslint-disable-line
      expect(updateBankDetails.called).to.be.true //eslint-disable-line
      expect(updateBankDetails.calledWith(BANK_DETAILS.ClaimBankDetailId, reference, claimId, BANK_DETAILS.SortCode, BANK_DETAILS.AccountNumber)).to.be.true //eslint-disable-line
      expect(insertClaimEvent.calledWith(reference, eligibilityId, claimId, null, claimEventEnum.BANK_DETAILS_UPDATED.value, null, null, true))
      expect(transactionHelper.calledWith(eligibilityId, claimId)).to.be.true //eslint-disable-line
    })
  })

  it('should not call bank details methods', function () {
    getAllClaimData.resolves(CLAIM_DATA_FOR_PAYOUT)
    return requestInformationResponse.execute({
      reference,
      eligibilityId,
      claimId
    }).then(function () {
      expect(getAllClaimData.calledWith('IntSchema', reference, eligibilityId, claimId)).to.be.true //eslint-disable-line
      expect(updateBankDetails.called).to.be.false //eslint-disable-line
    })
  })
})
