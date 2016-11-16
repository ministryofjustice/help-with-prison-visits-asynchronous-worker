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

        // Set one expense to APPROVED
        return knex('IntSchema.ClaimExpense')
          .where('ClaimExpenseId', claimExpenseId1)
          .update('Status', 'REJECTED')
      })
      // Set one expense to REJECTED
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
    return getApprovedClaimExpenseData.getClaimExpenseData(claimId)
      .then(function (result) {
        return knex('IntSchema.ClaimExpense').where('Reference', reference)
          .then(function (claimExpenses) {
            claimExpenses.forEach(function(claimExpense) {
              expect(claimExpense.ClaimId).to.be.equal(claimId)
              expect(claimExpense.Reference).to.be.equal(reference)
            })
          })
      })
  })

  it('should retrieve details of the visitor including their first name and last 4 digits of their bank account number', function() {
    return getApprovedClaimExpenseData.getClaimantData(reference, claimId)
      .then(function(result) {
        return knex('IntSchema.Visitor').where('Reference', reference).first()
          .then(function(visitor) {
            expect(result.VisitorFirstName).to.be.equal(visitor.FirstName)
          })
          .then(function() {
            return knex('IntSchema.ClaimBankDetail').where('Reference', reference).first()
              .then(function(bankDetail) {
                var lastFourDigits = bankDetail.AccountNumber.substr(bankDetail.AccountNumber.length - 4)
                expect(result.AccountNumberLastFourDigits).to.be.equal(lastFourDigits)
              })
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
}) 
