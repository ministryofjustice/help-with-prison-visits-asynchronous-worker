const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const reference = '1234567'
const eligibilityId = '1234'
const claimId = 123

const CLAIM_DATA_FOR_UNREVIEWED_CLAIM = { Claim: { DateReviewed: null } }
const CLAIM_DATA_FOR_REVIEWED_CLAIM = { Claim: { DateReviewed: new Date() } }
const SINGLE_UPLOADED_DOCUMENT = [{ClaimDocumentId: 1, DocumentType: 'VISIT-CONFIRMATION', DocumentStatus: 'uploaded'}]

var moveClaimDocumentsToInternal
var getAllClaimData
var updateClaimStatus
var insertClaimEvent
var generateClaimUpdatedString
var autoApprovalProcess

var requestInformationResponse

describe('services/workers/request-information-response', function () {
  beforeEach(function () {
    moveClaimDocumentsToInternal = sinon.stub().resolves(SINGLE_UPLOADED_DOCUMENT)
    getAllClaimData = sinon.stub().resolves(CLAIM_DATA_FOR_UNREVIEWED_CLAIM)
    updateClaimStatus = sinon.stub().resolves()
    insertClaimEvent = sinon.stub().resolves()
    generateClaimUpdatedString = sinon.stub().returns('message')
    autoApprovalProcess = sinon.stub().resolves()

    requestInformationResponse = proxyquire('../../../../app/services/workers/request-information-response', {
      '../data/move-claim-documents-to-internal': moveClaimDocumentsToInternal,
      '../data/get-all-claim-data': getAllClaimData,
      '../data/update-claim-status': updateClaimStatus,
      '../data/insert-claim-event': insertClaimEvent,
      '../notify/helpers/generate-claim-updated-string': generateClaimUpdatedString,
      '../auto-approval/auto-approval-process': autoApprovalProcess
    })
  })

  it('should call data methods to move claim documents, update status and trigger auto-approval', function () {
    return requestInformationResponse.execute({
      reference: reference,
      eligibilityId: eligibilityId,
      claimId: claimId
    }).then(function () {
      expect(moveClaimDocumentsToInternal.calledWith(reference, eligibilityId, claimId)).to.be.true
      expect(getAllClaimData.calledWith('IntSchema', reference, eligibilityId, claimId)).to.be.true
      expect(updateClaimStatus.calledWith(claimId, 'NEW')).to.be.true
      expect(generateClaimUpdatedString.calledOnce).to.be.true
      expect(insertClaimEvent.calledTwice, 'should have inserted event for update and uploaded document').to.be.true
      expect(autoApprovalProcess.calledWith(reference, eligibilityId, claimId)).to.be.true
    })
  })

  it('should not trigger auto-approval for previously reviewed claims', function () {
    getAllClaimData.resolves(CLAIM_DATA_FOR_REVIEWED_CLAIM)

    return requestInformationResponse.execute({
      reference: reference,
      eligibilityId: eligibilityId,
      claimId: claimId
    }).then(function () {
      expect(autoApprovalProcess.called).to.be.false
    })
  })
})
