const taskEnum = require('../../../../app/constants/tasks-enum')

const reference = '1234567'
const eligibilityId = '1234'
const claimId = 123
const emailAddress = 'test@test.com'

const claimData = {
  Claim: {
    ClaimId: 1,
    EligibilityId: 1,
    Reference: '12345',
  },
}

const mockGetAllClaimData = jest.fn().mockResolvedValue(claimData)
const mockMigrateClaimToInternalAsTransaction = jest.fn().mockResolvedValue()
const mockCalculateCarExpenseCosts = jest.fn().mockResolvedValue()
// autoApprovalProcess Removed in APVS0115
const mockInsertTask = jest.fn().mockResolvedValue()
const mockGetVisitorEmailAddress = jest.fn().mockResolvedValue(emailAddress)

jest.mock('../../../../app/services/data/get-all-claim-data', () => mockGetAllClaimData)

jest.mock(
  '../../../../app/services/data/migrate-claim-to-internal-as-transaction',
  () => mockMigrateClaimToInternalAsTransaction,
)

jest.mock('../../../../app/services/distance-checker/calculate-car-expense-costs', () => mockCalculateCarExpenseCosts)

jest.mock('../../../../app/services/data/insert-task', () => mockInsertTask)
jest.mock('../../../../app/services/data/get-visitor-email-address', () => mockGetVisitorEmailAddress)

const completeClaim = require('../../../../app/services/workers/complete-claim')

describe('services/workers/complete-claim', function () {
  it('should call to retrieve, copy and delete first time claim, calculate car expenses, run auto-approval checks, insert notification and DWP check tasks', function () {
    return completeClaim
      .execute({
        reference,
        additionalData: null,
        eligibilityId,
        claimId,
      })
      .then(function () {
        expect(mockGetAllClaimData).toHaveBeenCalledWith('ExtSchema', reference, eligibilityId, claimId)
        expect(mockMigrateClaimToInternalAsTransaction).toHaveBeenCalledWith(claimData, null, eligibilityId, claimId)
        expect(mockCalculateCarExpenseCosts).toHaveBeenCalledWith(reference, eligibilityId, claimId)
        // autoApprovalProcess Removed in APVS0115
        expect(mockGetVisitorEmailAddress).toHaveBeenCalledWith('IntSchema', reference, eligibilityId)
        expect(mockInsertTask).toHaveBeenCalledWith(
          reference,
          eligibilityId,
          claimId,
          taskEnum.SEND_CLAIM_NOTIFICATION,
          emailAddress,
        )
        expect(mockInsertTask).toHaveBeenCalledWith(reference, eligibilityId, claimId, taskEnum.DWP_CHECK)
      })
  })
})
