const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')
const getClaimsPendingPayment = require('../../../../app/services/data/get-claims-pending-payment')

describe('services/data/get-claims-pending-payment', function () {
  var reference = 'TS1234G'
  var claimId
  var claimExpenseId1
  var claimExpenseId2

  beforeEach(function () {
    return testHelper.insertClaimEligibilityData('IntSchema', reference)
      .then(function (ids) {
        claimId = ids.claimId
      })
      .then(function () {
        return knex('IntSchema.Claim')
          .where('ClaimId', claimId)
          .update('Status', 'APPROVED')
      })
      .then(function () {
        return knex('IntSchema.ClaimExpense')
          .where('ClaimId', claimId)
          .select('ClaimExpenseId')
      })
      .then(function (claimExpenses) {
        claimExpenseId1 = claimExpenses[0].ClaimExpenseId
        claimExpenseId2 = claimExpenses[1].ClaimExpenseId

        // Set one expense to REJECTED
        return knex('IntSchema.ClaimExpense')
          .where('ClaimExpenseId', claimExpenseId1)
          .update('Status', 'REJECTED')
      })
      // Set one expense to APPROVED
      .then(function () {
        return knex('IntSchema.ClaimExpense')
          .where('ClaimExpenseId', claimExpenseId2)
          .update({
            'Status': 'APPROVED',
            'ApprovedCost': 25
          })
      })
  })

  it('should retrieve only APPROVED claim records with payment status of PENDING', function () {
    return getClaimsPendingPayment()
      .then(function (results) {
        expect(results[1].TotalApprovedCost).to.be.equal(25)
      })
  })

  after(function () {
    testHelper.deleteAll(reference, 'IntSchema')
  })
})
