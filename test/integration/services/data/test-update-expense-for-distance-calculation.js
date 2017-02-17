const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')

const updateExpenseForDistanceCalculation = require('../../../../app/services/data/update-expense-for-distance-calculation')

describe('services/data/update-expense-for-distance-calculation', function () {
  const REFERENCE = 'DISTCAL'
  const FROM_POSTCODE = 'NT12 34A'
  const TO_POSTCODE = 'NT43 21A'
  const DISTANCE = 123.33
  const COST = 10.45

  var claimId
  var claimExpenseId

  before(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', REFERENCE)
      .then(function (ids) {
        claimId = ids.claimId
        return knex('IntSchema.ClaimExpense').where('ClaimId', claimId).first('ClaimExpenseId')
          .then(function (result) {
            claimExpenseId = result.ClaimExpenseId
          })
      })
  })

  it('should update the ClaimExpense postcode, distance and cost columns', function () {
    return updateExpenseForDistanceCalculation(claimExpenseId, FROM_POSTCODE, TO_POSTCODE, DISTANCE, COST)
      .then(function () {
        return knex('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpenseId).first()
          .then(function (claimExpense) {
            expect(claimExpense.FromPostCode).to.be.equal(FROM_POSTCODE)
            expect(claimExpense.ToPostCode).to.be.equal(TO_POSTCODE)
            expect(claimExpense.Distance).to.be.equal(DISTANCE)
            expect(claimExpense.Cost).to.be.equal(COST)
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(REFERENCE, 'IntSchema')
  })
})
