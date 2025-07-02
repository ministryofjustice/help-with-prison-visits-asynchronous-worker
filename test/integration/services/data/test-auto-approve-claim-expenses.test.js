const { getDatabaseConnector } = require('../../../../app/databaseConnector')

const autoApproveClaimExpenses = require('../../../../app/services/data/auto-approve-claim-expenses')
const testHelper = require('../../../test-helper')
const statusEnum = require('../../../../app/constants/status-enum')

const reference = 'AUTOAPV'
let claimId

describe('services/data/auto-approve-claim-expenses', () => {
  beforeAll(() => {
    return testHelper.insertClaimEligibilityData('IntSchema', reference).then(ids => {
      claimId = ids.claimId
    })
  })

  it('should update the status and approved cost of all specified claim expenses', () => {
    return autoApproveClaimExpenses(claimId).then(() => {
      const db = getDatabaseConnector()

      return db('IntSchema.ClaimExpense')
        .where('ClaimId', claimId)
        .then(claimExpenses => {
          claimExpenses.forEach(claimExpense => {
            expect(claimExpense.Status).toBe(statusEnum.APPROVED)
            expect(claimExpense.ApprovedCost).toBe(claimExpense.Cost)
          })
        })
    })
  })

  afterAll(() => {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
