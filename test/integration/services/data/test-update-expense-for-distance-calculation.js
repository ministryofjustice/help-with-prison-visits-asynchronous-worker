const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')

const updateExpenseForDistanceCalculation = require('../../../../app/services/data/update-expense-for-distance-calculation')

describe('services/data/update-expense-for-distance-calculation', function () {
  const REFERENCE = 'DISTCAL'
  const FROM_POSTCODE = 'NT12 34A'
  const TO_POSTCODE = 'NT43 21A'
  const DISTANCE = 123.33
  const COST = 10.45

  let claimId
  let claimExpenseId

  beforeAll(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE).then(function (ids) {
      claimId = ids.claimId
      const db = getDatabaseConnector()

      return db('IntSchema.ClaimExpense')
        .where('ClaimId', claimId)
        .first('ClaimExpenseId')
        .then(function (result) {
          claimExpenseId = result.ClaimExpenseId
        })
    })
  })

  it('should update the ClaimExpense postcode, distance and cost columns', function () {
    return updateExpenseForDistanceCalculation(claimExpenseId, FROM_POSTCODE, TO_POSTCODE, DISTANCE, COST).then(
      function () {
        const db = getDatabaseConnector()

        return db('IntSchema.ClaimExpense')
          .where('ClaimExpenseId', claimExpenseId)
          .first()
          .then(function (claimExpense) {
            expect(claimExpense.FromPostCode).toBe(FROM_POSTCODE)
            expect(claimExpense.ToPostCode).toBe(TO_POSTCODE)
            expect(claimExpense.Distance).toBe(DISTANCE)
            expect(claimExpense.Cost).toBe(COST)
          })
      },
    )
  })

  afterAll(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
