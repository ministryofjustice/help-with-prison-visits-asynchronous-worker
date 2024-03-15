const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const sinon = require('sinon')

const testHelper = require('../../../test-helper')
const statusEnum = require('../../../../app/constants/status-enum')
const tasksEnum = require('../../../../app/constants/tasks-enum')
const claimEventEnum = require('../../../../app/constants/claim-event-enum')

const autoApproveClaimExpenseStub = sinon.stub().resolves()
const insertTaskStub = sinon.stub().resolves()
const insertClaimEventStub = sinon.stub().resolves()

jest.mock('./auto-approve-claim-expenses', () => autoApproveClaimExpenseStub);
jest.mock('../data/insert-task', () => insertTaskStub);
jest.mock('../data/insert-claim-event', () => insertClaimEventStub);

const autoApproveClaim = require('../../../../app/services/data/auto-approve-claim')

const REFERENCE = 'AUTOAPP'
const EMAIL_ADDRESS = 'donotsend@apvs.com'
let eligibilityId
let claimId

describe('services/data/auto-approve-claim', function () {
  beforeAll(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        eligibilityId = ids.eligibilityId
        claimId = ids.claimId
      })
  })

  it('should update the status of the claim to AUTOAPPROVED, add current timestamp to DateApproved, call to update expenses, send accept email and add claim event', function () {
    return autoApproveClaim(REFERENCE, eligibilityId, claimId, EMAIL_ADDRESS)
      .then(function () {
        const db = getDatabaseConnector()

        return db('IntSchema.Claim')
          .where('ClaimId', claimId)
          .first()
          .then(function (claim) {
            expect(claim.Status).toBe(statusEnum.AUTOAPPROVED)
            expect(claim.DateApproved).not.toBeNull() //eslint-disable-line
            expect(claim.VisitConfirmationCheck).toBe(statusEnum.APPROVED) //eslint-disable-line
            expect(autoApproveClaimExpenseStub.calledWith(claimId)).toBe(true) //eslint-disable-line
            expect(insertTaskStub.calledWith(REFERENCE, eligibilityId, claimId, tasksEnum.ACCEPT_CLAIM_NOTIFICATION, EMAIL_ADDRESS)).toBe(true) //eslint-disable-line
            expect(insertClaimEventStub.calledWith(REFERENCE, eligibilityId, claimId, null, claimEventEnum.CLAIM_AUTO_APPROVED.value, null, 'Passed all auto approval checks', true)).toBe(true) //eslint-disable-line
          });
      });
  })

  afterAll(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
