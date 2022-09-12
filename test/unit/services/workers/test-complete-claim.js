const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const taskEnum = require('../../../../app/constants/tasks-enum')

const reference = '1234567'
const eligibilityId = '1234'
const claimId = 123
const emailAddress = 'test@test.com'

const claimData = {
  Claim: {
    ClaimId: 1,
    EligibilityId: 1,
    Reference: '12345'
  }
}

const getAllClaimData = sinon.stub().resolves(claimData)
const migrateClaimToInternalAsTransaction = sinon.stub().resolves()
const calculateCarExpenseCosts = sinon.stub().resolves()
// autoApprovalProcess Removed in APVS0115
const insertTask = sinon.stub().resolves()
const getVisitorEmailAddress = sinon.stub().resolves(emailAddress)

const completeClaim = proxyquire('../../../../app/services/workers/complete-claim', {
  '../data/get-all-claim-data': getAllClaimData,
  '../data/migrate-claim-to-internal-as-transaction': migrateClaimToInternalAsTransaction,
  '../distance-checker/calculate-car-expense-costs': calculateCarExpenseCosts,
  // autoApprovalProcess Removed in APVS0115
  '../data/insert-task': insertTask,
  '../data/get-visitor-email-address': getVisitorEmailAddress
})

describe('services/workers/complete-claim', function () {
  it('should call to retrieve, copy and delete first time claim, calculate car expenses, run auto-approval checks, insert notification and DWP check tasks', function () {
    return completeClaim.execute({
      reference,
      additionalData: null,
      eligibilityId,
      claimId
    }).then(function () {
      expect(getAllClaimData.calledWith('ExtSchema', reference, eligibilityId, claimId)).to.be.true //eslint-disable-line
      expect(migrateClaimToInternalAsTransaction.calledWith(claimData, null, eligibilityId, claimId)).to.be.true //eslint-disable-line
      expect(calculateCarExpenseCosts.calledWith(reference, eligibilityId, claimId)).to.be.true //eslint-disable-line
      // autoApprovalProcess Removed in APVS0115
      expect(getVisitorEmailAddress.calledWith('IntSchema', reference, eligibilityId)).to.be.true //eslint-disable-line
      expect(insertTask.calledWith(reference, eligibilityId, claimId, taskEnum.SEND_CLAIM_NOTIFICATION, emailAddress)).to.be.true //eslint-disable-line
      expect(insertTask.calledWith(reference, eligibilityId, claimId, taskEnum.DWP_CHECK)).to.be.true //eslint-disable-line
    })
  })
})
