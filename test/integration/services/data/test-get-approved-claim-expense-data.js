const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')

const getApprovedClaimExpenseData = require('../../../../app/services/data/get-approved-claim-expense-data')

describe('services/data/get-approved-claim-expense-data', function () {
  var reference = 'DWPVISI'
  var claimId
  var claimExpenseId1
  var claimExpenseId2

  beforeEach(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', reference)
      .then(function (ids) {
        claimId = ids.claimId
      })
      .then(function () {
        return knex('IntSchema.ClaimExpense')
          .where('ClaimId', claimId)
          .select('ClaimExpenseId')
      })
      .then(function(claimExpenses) {
        claimExpenseId1 = claimExpenses[0].ClaimExpenseId
        claimExpenseId2 = claimExpenses[1].ClaimExpenseId

        // Set one expense to REJECTED
        return knex('IntSchema.ClaimExpense')
          .where('ClaimExpenseId', claimExpenseId1)
          .update('Status', 'REJECTED')
      })
      // Set one expense to APPROVED
      .then(function() {
        return knex('IntSchema.ClaimExpense')
          .where('ClaimExpenseId', claimExpenseId2)
          .update({
            'Status': 'APPROVED',
            'ApprovedCost': 20
          })
      })
  })

  it('should retrieve only claim expenses relating to the claim with the specified reference and claim id', function () {
    return getApprovedClaimExpenseData(reference, claimId)
      .then(function (result) {
        return knex('IntSchema.ClaimExpense')
          .where('ClaimExpenseId', claimExpenseId1)
          .first()
          .then(function (claimExpense) {
            expect(claimExpense.Status).to.be.equal('REJECTED')
          })
          .then(function() {
            return knex('IntSchema.ClaimExpense')
              .where('ClaimExpenseId', claimExpenseId2)
              .first()
          })
          .then(function (claimExpense) {
            expect(claimExpense.Status).to.be.equal('APPROVED')
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
}) 
