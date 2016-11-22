const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const reference = '1234567'
const eligibilityId = '1234'
const claimId = 123

var firstTimeClaimData = {}

var getAllFirstTimeClaimData = sinon.stub().resolves(firstTimeClaimData)
var copyFirstTimeClaimDataToInternal = sinon.stub().resolves()
var deleteFirstTimeClaimFromExternal = sinon.stub().resolves()
var insertTaskDwpCheck = sinon.stub().resolves()

const completeClaim = proxyquire('../../../../app/services/workers/complete-claim', {
  '../data/get-all-first-time-claim-data': getAllFirstTimeClaimData,
  '../data/copy-first-time-claim-data-to-internal': copyFirstTimeClaimDataToInternal,
  '../data/delete-first-time-claim-from-external': deleteFirstTimeClaimFromExternal,
  '../data/insert-task-dwp-check': insertTaskDwpCheck
})

describe('services/workers/complete-claim', function () {
  it('should call to retrieve, copy and delete first time claim, insert DWP check task', function () {
    return completeClaim.execute({
      reference: reference,
      eligibilityId: eligibilityId,
      claimId: claimId
    }).then(function () {
      expect(getAllFirstTimeClaimData.calledWith(reference, eligibilityId, claimId)).to.be.true
      expect(copyFirstTimeClaimDataToInternal.calledWith(firstTimeClaimData)).to.be.true
      expect(deleteFirstTimeClaimFromExternal.calledWith(eligibilityId, claimId)).to.be.true
      expect(insertTaskDwpCheck.calledWith(reference, eligibilityId, claimId)).to.be.true
    })
  })
})
