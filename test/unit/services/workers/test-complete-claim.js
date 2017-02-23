const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const taskEnum = require('../../../../app/constants/tasks-enum')

const reference = '1234567'
const eligibilityId = '1234'
const claimId = 123
const emailAddress = 'test@test.com'

var claimData = {
  Claim: {
    ClaimId: 1,
    EligibilityId: 1,
    Reference: '12345'
  }
}

var getAllClaimData = sinon.stub().resolves(claimData)
var copyClaimDataToInternal = sinon.stub().resolves()
var deleteClaimFromExternal = sinon.stub().resolves()
var calculateCarExpenseCosts = sinon.stub().resolves()
var autoApprovalProcess = sinon.stub().resolves()
var insertTask = sinon.stub().resolves()
var getVisitorEmailAddress = sinon.stub().resolves(emailAddress)

const completeClaim = proxyquire('../../../../app/services/workers/complete-claim', {
  '../data/get-all-claim-data': getAllClaimData,
  '../data/copy-claim-data-to-internal': copyClaimDataToInternal,
  '../data/delete-claim-from-external': deleteClaimFromExternal,
  '../distance-checker/calculate-car-expense-costs': calculateCarExpenseCosts,
  '../auto-approval/auto-approval-process': autoApprovalProcess,
  '../data/insert-task': insertTask,
  '../data/get-visitor-email-address': getVisitorEmailAddress
})

describe('services/workers/complete-claim', function () {
  it('should call to retrieve, copy and delete first time claim, calculate car expenses, run auto-approval checks, insert notification and DWP check tasks', function () {
    return completeClaim.execute({
      reference: reference,
      eligibilityId: eligibilityId,
      claimId: claimId
    }).then(function () {
      expect(getAllClaimData.calledWith('ExtSchema', reference, eligibilityId, claimId)).to.be.true
      expect(copyClaimDataToInternal.calledWith(claimData)).to.be.true
      expect(deleteClaimFromExternal.calledWith(eligibilityId, claimId)).to.be.true
      expect(calculateCarExpenseCosts.calledWith(reference, eligibilityId, claimId)).to.be.true
      expect(autoApprovalProcess.calledWith(reference, eligibilityId, claimId)).to.be.true
      expect(getVisitorEmailAddress.calledWith('IntSchema', reference, eligibilityId)).to.be.true
      expect(insertTask.calledWith(reference, eligibilityId, claimId, taskEnum.SEND_CLAIM_NOTIFICATION, emailAddress)).to.be.true
      expect(insertTask.calledWith(reference, eligibilityId, claimId, taskEnum.DWP_CHECK)).to.be.true
    })
  })
})
