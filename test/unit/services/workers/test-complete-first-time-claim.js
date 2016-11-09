const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const reference = '1234567'
const claimId = 123
const newClaimId = 321
var firstTimeClaimData = {}

var getAllFirstTimeClaimData = sinon.stub().resolves(firstTimeClaimData)
var copyFirstTimeClaimDataToInternal = sinon.stub().resolves(newClaimId)
var deleteFirstTimeClaimFromExternal = sinon.stub().resolves()
var insertTaskDwpCheck = sinon.stub().resolves()

const completeFirstTimeClaim = proxyquire('../../../../app/services/workers/complete-first-time-claim', {
  '../data/get-all-first-time-claim-data': getAllFirstTimeClaimData,
  '../data/copy-first-time-claim-data-to-internal': copyFirstTimeClaimDataToInternal,
  '../data/delete-first-time-claim-from-external': deleteFirstTimeClaimFromExternal,
  '../data/insert-task-dwp-check': insertTaskDwpCheck
})

describe('services/workers/complete-first-time-claim', function () {
  it('should call to retrieve, copy and delete first time claim, insert DWP check task', function () {
    return completeFirstTimeClaim.execute({
      reference: reference,
      claimId: claimId
    }).then(function () {
      expect(getAllFirstTimeClaimData.calledWith(reference, claimId)).to.be.true
      expect(copyFirstTimeClaimDataToInternal.calledWith(firstTimeClaimData)).to.be.true
      expect(deleteFirstTimeClaimFromExternal.calledOnce).to.be.true
      expect(insertTaskDwpCheck.calledWith(reference, newClaimId)).to.be.true
    })
  })
})
