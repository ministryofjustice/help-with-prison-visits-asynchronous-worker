const expect = require('chai').expect
const config = require('../../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../../test-helper')
const getApprovedClaimDetailsString = require('../../../../../app/services/notify/helpers/get-approved-claim-details-string')

describe('notify/helpers/get-approved-claim-details-string', function () {
  var reference = 'DWPVISI'

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
          .update({
            'Status': 'REJECTED',
            'ExpenseType': 'accommodation',
            'ApprovedCost': 0
          })
      })
      // Set one expense to APPROVED
      .then(function() {
        return knex('IntSchema.ClaimExpense')
          .where('ClaimExpenseId', claimExpenseId2)
          .update({
            'Status': 'APPROVED',
            'ApprovedCost': 20,
            'Cost': 30
          })
      })
  })

  it('should contain journey info if claim expense type is a journey type', function () {
    return knex('IntSchema.ClaimExpense')
      .where('ClaimExpenseId', claimExpenseId2)
      .then(function(claimExpense) {
        var claimDetails =  getApprovedClaimDetailsString(claimExpense)
        expect(claimDetails).to.contain('Bus journey - Euston to Birmingham')  
      })
  })

  it('should contain just the expense type if claim expense type is not a journey type', function () {
    return knex('IntSchema.ClaimExpense')
      .where('ClaimExpenseId', claimExpenseId1)
      .then(function(claimExpense) {
        var claimDetails =  getApprovedClaimDetailsString(claimExpense)
        expect(claimDetails).to.contain('Accommodation')  
      })
  })

  it('should contain the correct claim amount', function () {
    return knex('IntSchema.ClaimExpense')
      .where('ClaimExpenseId', claimExpenseId2)
      .then(function(claimExpense) {
        var claimDetails =  getApprovedClaimDetailsString(claimExpense)
        expect(claimDetails).to.contain('Claimed: £30.00')
      })
  })

  it('should contain the correct approved amount', function () {
    return knex('IntSchema.ClaimExpense')
      .where('ClaimExpenseId', claimExpenseId2)
      .then(function(claimExpense) {
        var claimDetails =  getApprovedClaimDetailsString(claimExpense)
        expect(claimDetails).to.contain('Approved: £20.00')  
      })
  })

  it('should return nothing if no claims expenses exist', function () {
    return knex('IntSchema.ClaimExpense')
      .where('ClaimExpenseId', '0')
      .then(function(claimExpense) {
        var claimDetails =  getApprovedClaimDetailsString(claimExpense)
        expect(claimDetails).to.equal('')  
      })
  })
})