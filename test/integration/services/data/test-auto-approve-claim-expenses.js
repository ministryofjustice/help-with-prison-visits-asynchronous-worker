const { getDatabaseConnector } = require('../../../../app/databaseConnector')

const autoApproveClaimExpenses = require('../../../../app/services/data/auto-approve-claim-expenses')
const testHelper = require('../../../test-helper')
const statusEnum = require('../../../../app/constants/status-enum')

const reference = 'AUTOAPV'
let claimId

describe('services/data/auto-approve-claim-expenses', function () {
  beforeAll(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', reference)
      .then(function (ids) {
        claimId = ids.claimId
      })
  })

  it('should update the status and approved cost of all specified claim expenses', function () {
    return autoApproveClaimExpenses(claimId)
      .then(function () {
        const db = getDatabaseConnector()

        return db('IntSchema.ClaimExpense')
          .where('ClaimId', claimId)
          .then(function (claimExpenses) {
            claimExpenses.forEach(function (claimExpense) {
              expect(claimExpense.Status).toBe(statusEnum.APPROVED)
              expect(claimExpense.ApprovedCost).toBe(claimExpense.Cost)
            })
          });
      });
  })

  afterAll(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
