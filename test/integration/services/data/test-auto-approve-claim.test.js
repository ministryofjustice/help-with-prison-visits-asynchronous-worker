const { getDatabaseConnector } = require('../../../../app/databaseConnector')

const testHelper = require('../../../test-helper')
const statusEnum = require('../../../../app/constants/status-enum')
const tasksEnum = require('../../../../app/constants/tasks-enum')
const claimEventEnum = require('../../../../app/constants/claim-event-enum')

const autoApproveClaimExpenseStub = jest.fn().mockResolvedValue()
const insertTaskStub = jest.fn().mockResolvedValue()
const insertClaimEventStub = jest.fn().mockResolvedValue()

jest.mock('./auto-approve-claim-expenses', () => autoApproveClaimExpenseStub)
jest.mock('../data/insert-task', () => insertTaskStub)
jest.mock('../data/insert-claim-event', () => insertClaimEventStub)

const autoApproveClaim = require('../../../../app/services/data/auto-approve-claim')

const REFERENCE = 'AUTOAPP'
const EMAIL_ADDRESS = 'donotsend@apvs.com'
let eligibilityId
let claimId

describe('services/data/auto-approve-claim', () => {
  beforeAll(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE).then(ids => {
      eligibilityId = ids.eligibilityId
      claimId = ids.claimId
    })
  })

  it('should update the status of the claim to AUTOAPPROVED, add current timestamp to DateApproved, call to update expenses, send accept email and add claim event', () => {
    return autoApproveClaim(REFERENCE, eligibilityId, claimId, EMAIL_ADDRESS).then(() => {
      const db = getDatabaseConnector()

      return db('IntSchema.Claim')
        .where('ClaimId', claimId)
        .first()
        .then(claim => {
          expect(claim.Status).toBe(statusEnum.AUTOAPPROVED)
          expect(claim.DateApproved).not.toBeNull()
          expect(claim.VisitConfirmationCheck).toBe(statusEnum.APPROVED)
          expect(autoApproveClaimExpenseStub).toHaveBeenCalledWith(claimId).toBe(true)
          expect(insertTaskStub)
            .toHaveBeenCalledWith(REFERENCE, eligibilityId, claimId, tasksEnum.ACCEPT_CLAIM_NOTIFICATION, EMAIL_ADDRESS)
            .toBe(true)
          expect(insertClaimEventStub)
            .toHaveBeenCalledWith(
              REFERENCE,
              eligibilityId,
              claimId,
              null,
              claimEventEnum.CLAIM_AUTO_APPROVED.value,
              null,
              'Passed all auto approval checks',
              true,
            )
            .toBe(true)
        })
    })
  })

  afterAll(() => {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
