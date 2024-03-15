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

jest.mock('../data/get-all-claim-data', () => getAllClaimData);

jest.mock(
  '../data/migrate-claim-to-internal-as-transaction',
  () => migrateClaimToInternalAsTransaction
);

jest.mock(
  '../distance-checker/calculate-car-expense-costs',
  () => calculateCarExpenseCosts
);

jest.mock('../data/insert-task', () => insertTask);
jest.mock('../data/get-visitor-email-address', () => getVisitorEmailAddress);

const completeClaim = require('../../../../app/services/workers/complete-claim')

describe('services/workers/complete-claim', function () {
  it('should call to retrieve, copy and delete first time claim, calculate car expenses, run auto-approval checks, insert notification and DWP check tasks', function () {
    return completeClaim.execute({
      reference,
      additionalData: null,
      eligibilityId,
      claimId
    }).then(function () {
      expect(getAllClaimData.calledWith('ExtSchema', reference, eligibilityId, claimId)).toBe(true) //eslint-disable-line
      expect(migrateClaimToInternalAsTransaction.calledWith(claimData, null, eligibilityId, claimId)).toBe(true) //eslint-disable-line
      expect(calculateCarExpenseCosts.calledWith(reference, eligibilityId, claimId)).toBe(true) //eslint-disable-line
      // autoApprovalProcess Removed in APVS0115
      expect(getVisitorEmailAddress.calledWith('IntSchema', reference, eligibilityId)).toBe(true) //eslint-disable-line
      expect(insertTask.calledWith(reference, eligibilityId, claimId, taskEnum.SEND_CLAIM_NOTIFICATION, emailAddress)).toBe(true) //eslint-disable-line
      expect(insertTask.calledWith(reference, eligibilityId, claimId, taskEnum.DWP_CHECK)).toBe(true) //eslint-disable-line
    });
  })
})
