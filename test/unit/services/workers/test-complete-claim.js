const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const reference = '1234567'
const eligibilityId = '1234'
const claimId = 123

var firstTimeClaimData = {}

var getAllClaimData = sinon.stub().resolves(firstTimeClaimData)
var copyClaimDataToInternal = sinon.stub().resolves()
var deleteClaimFromExternal = sinon.stub().resolves()
var insertTaskDwpCheck = sinon.stub().resolves()

const completeClaim = proxyquire('../../../../app/services/workers/complete-claim', {
  '../data/get-all-claim-data': getAllClaimData,
  '../data/copy-claim-data-to-internal': copyClaimDataToInternal,
  '../data/delete-claim-from-external': deleteClaimFromExternal,
  '../data/insert-task-dwp-check': insertTaskDwpCheck
})

describe('services/workers/complete-claim', function () {
  it('should call to retrieve, copy and delete first time claim, insert DWP check task', function () {
    return completeClaim.execute({
      reference: reference,
      eligibilityId: eligibilityId,
      claimId: claimId
    }).then(function () {
      expect(getAllClaimData.calledWith(reference, eligibilityId, claimId)).to.be.true
      expect(copyClaimDataToInternal.calledWith(firstTimeClaimData)).to.be.true
      expect(deleteClaimFromExternal.calledWith(eligibilityId, claimId)).to.be.true
      expect(insertTaskDwpCheck.calledWith(reference, eligibilityId, claimId)).to.be.true
    })
  })
})
