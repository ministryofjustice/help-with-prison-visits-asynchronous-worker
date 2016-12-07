const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const reference = '1234567'
const eligibilityId = '1234'
const claimId = 123

var claimData = {
  Claim: {
    ClaimId: 1,
    EligibilityId: 1,
    Reference: '12345'
  }
}

var getAllClaimData = sinon.stub().resolves(claimData)
var moveClaimDocumentsToInternalAndUpdateExisting = sinon.stub().resolves()
var updateClaimStatusIfAllDocumentsSupplied = sinon.stub().resolves()
var autoApprovalProcess = sinon.stub().resolves()

const requestInformationResponse = proxyquire('../../../../app/services/workers/request-information-response', {
  '../data/get-all-claim-data': getAllClaimData,
  '../data/move-claim-documents-to-internal-and-update-existing': moveClaimDocumentsToInternalAndUpdateExisting,
  '../data/update-claim-status-if-all-documents-supplied': updateClaimStatusIfAllDocumentsSupplied,
  '../auto-approval/auto-approval-process': autoApprovalProcess
})

describe('services/workers/request-information-response', function () {
  it('should call data methods to move claim documents, update status and trigger auto-approval', function () {
    return requestInformationResponse.execute({
      reference: reference,
      eligibilityId: eligibilityId,
      claimId: claimId
    }).then(function () {
      expect(getAllClaimData.calledWith(reference, eligibilityId, claimId)).to.be.true
      expect(moveClaimDocumentsToInternalAndUpdateExisting.calledWith(claimData)).to.be.true
      expect(updateClaimStatusIfAllDocumentsSupplied.calledWith(claimData)).to.be.true
      expect(autoApprovalProcess.calledWith(claimData)).to.be.true
    })
  })
})
