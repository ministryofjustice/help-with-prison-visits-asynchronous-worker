const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const testHelper = require('../../../test-helper')
const dateFormatter = require('../../../../app/services/date-formatter')
require('sinon-bluebird')
const paymentMethods = require('../../../../app/constants/payment-method-enum')
const getTopUpsPendingPayment = require('../../../../app/services/data/get-topups-pending-payment')

describe('services/data/get-claims-pending-payment', function () {
  var reference = 'TOPUP'
  var claimId
  var topUpId
  var claimExpenseId1
  var claimExpenseId2

  function beforeDataCreation () {
    return testHelper.insertClaimEligibilityData('IntSchema', reference)
      .then(function (ids) {
        claimId = ids.claimId
        topUpId = ids.topUpId
      })
      .then(function () {
        return knex('IntSchema.Claim')
          .where('ClaimId', claimId)
          .update({
            'Status': 'APPROVED',
            'DateApproved': dateFormatter.now().toDate()
          })
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
  }

  function changeClaimStatus (status) {
    return knex('IntSchema.Claim')
      .where('ClaimId', claimId)
      .update('Status', status)
  }

  function changeClaimDateApproved (dateApproved) {
    return knex('IntSchema.Claim')
      .where('ClaimId', claimId)
      .update('DateApproved', dateApproved)
  }

  describe('Direct Bank payment', function () {
    before(function () {
      return beforeDataCreation()
    })

    it('should retrieve only APPROVED claim records with payment status of NULL', function () {
      return getTopUpsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
        .then(function (results) {
          var filteredResults = results.filter(function (result) {
            return result[0] === claimId
          })
          expect(filteredResults.length === 1).to.be.true
          expect(filteredResults[0].length === 7, 'should contain 7 fields').to.be.true // updated to 7 as country is now included
          expect(filteredResults[0][0], 'should contain the claim id').to.be.equal(claimId)
          expect(filteredResults[0][1], 'should contain the sort code').to.be.equal('001122')
          expect(filteredResults[0][2], 'should contain the account number').to.be.equal('00123456')
          expect(filteredResults[0][3], 'should contain the visitor name').to.be.equal('Joe Bloggs')
          expect(filteredResults[0][4], 'should contain correct amount (including deductions)').to.be.equal('10.00')
          expect(filteredResults[0][5], 'should contain the reference').to.be.equal(reference)
        })
    })

    it('should return payment amount to two decimal places', function () {
      var update1 = knex('IntSchema.ClaimExpense')
        .where('ClaimExpenseId', claimExpenseId1)
        .update({
          ApprovedCost: '20.65',
          Status: 'APPROVED'
        })
      var update2 = knex('IntSchema.ClaimExpense')
        .where('ClaimExpenseId', claimExpenseId2)
        .update({
          ApprovedCost: '10.45',
          Status: 'MANUALLY-PROCESSED'
        })

      return Promise.all([update1, update2])
        .then(function () {
          return getTopUpsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
            .then(function (results) {
              var filteredResults = results.filter(function (result) {
                return result[0] === claimId
              })

              // Total approved amount: £31.10. Payment amount: £31.10 - £15 (deduction) - £10.45 (Manually processed) = £5.65
              expect(filteredResults[0][4], 'should return correct amount (excluding manually processed expenses)').to.equal('5.65')
            })
        })
    })

    it('should not return claims to be paid if PaymentAmount is not positive', function () {
      var update1 = knex('IntSchema.ClaimExpense')
        .where('ClaimExpenseId', claimExpenseId1)
        .update({
          ApprovedCost: '15',
          Status: 'APPROVED'
        })
      var update2 = knex('IntSchema.ClaimExpense')
        .where('ClaimExpenseId', claimExpenseId2)
        .update({
          ApprovedCost: '15',
          Status: 'MANUALLY-PROCESSED'
        })

      return Promise.all([update1, update2])
        .then(function () {
          return getTopUpsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
            .then(function (results) {
              var filteredResults = results.filter(function (result) {
                return result[0] === claimId
              })

              // Total approved amount: £30. Payment amount: £30 - £15 (deduction) - £15 (Manually processed) = £0.00
              expect(filteredResults.length, 'should not return claims to be paid given PaymentAmount of 0').to.equal(0)
            })
        })
    })

    it('should retrieve not retrieve claims with a PaymentMethod of manually processed', function () {
      return knex('IntSchema.Claim')
        .where('ClaimId', claimId)
        .update({'PaymentMethod': paymentMethods.MANUALLY_PROCESSED.value})
        .then(function () {
          return getTopUpsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
        })
        .then(function (results) {
          var filteredResults = results.filter(function (result) {
            return result[0] === claimId
          })

          expect(filteredResults.length === 0)
        })
    })

    after(function () {
      return testHelper.deleteAll(reference, 'IntSchema')
    })
  })

  describe('Payout payments', function () {
    before(function () {
      return beforeDataCreation()
        .then(function () {
          return knex('IntSchema.Claim')
            .where('ClaimId', claimId)
            .update('PaymentMethod', paymentMethods.PAYOUT.value)
        })
        .then(function () {
          return knex('IntSchema.ClaimBankDetail')
            .where('ClaimId', claimId)
            .del()
        })
    })
    it('should retrieve only APPROVED claim records with payment status of NULL', function () {
      var claimData = testHelper.getClaimData(reference)
      return getTopUpsPendingPayment(paymentMethods.PAYOUT.value)
        .then(function (results) {
          var filteredResults = results.filter(function (result) {
            return result[0] === claimId
          })
          expect(filteredResults.length === 1).to.be.true
          expect(filteredResults[0].length === 10, 'should contain 10 fields').to.be.true
          expect(filteredResults[0][0], 'should contain the claim id').to.be.equal(claimId)
          expect(filteredResults[0][1], 'should contain correct amount (including deductions)').to.be.equal('10.00')
          expect(filteredResults[0][2], 'should contain the visitor first name').to.be.equal(claimData.Visitor.FirstName)
          expect(filteredResults[0][3], 'should contain the visitor last name').to.be.equal(claimData.Visitor.LastName)
          expect(filteredResults[0][4], 'should contain the visitor house number and street').to.be.equal(claimData.Visitor.HouseNumberAndStreet)
          expect(filteredResults[0][5], 'should contain the visitor town').to.be.equal(claimData.Visitor.Town)
          expect(filteredResults[0][6], 'should contain the visitor county').to.be.equal(claimData.Visitor.County)
          expect(filteredResults[0][7], 'should contain the visitor country').to.be.equal(claimData.Visitor.Country)
          expect(filteredResults[0][8], 'should contain the visitor postcode').to.be.equal(claimData.Visitor.PostCode)
          expect(filteredResults[0][9], 'should contain the reference number').to.be.equal(reference)
        })
    })

    it('should retrieve UPDATED claim records with payment status of NULL', function () {
      return changeClaimStatus('UPDATED')
        .then(function () {
          var claimData = testHelper.getClaimData(reference)
          return getTopUpsPendingPayment(paymentMethods.PAYOUT.value)
            .then(function (results) {
              var filteredResults = results.filter(function (result) {
                return result[0] === claimId
              })
              expect(filteredResults.length === 1).to.be.true
              expect(filteredResults[0].length === 10, 'should contain 10 fields').to.be.true
              expect(filteredResults[0][0], 'should contain the claim id').to.be.equal(claimId)
              expect(filteredResults[0][1], 'should contain correct amount (including deductions)').to.be.equal('10.00')
              expect(filteredResults[0][2], 'should contain the visitor first name').to.be.equal(claimData.Visitor.FirstName)
              expect(filteredResults[0][3], 'should contain the visitor last name').to.be.equal(claimData.Visitor.LastName)
              expect(filteredResults[0][4], 'should contain the visitor house number and street').to.be.equal(claimData.Visitor.HouseNumberAndStreet)
              expect(filteredResults[0][5], 'should contain the visitor town').to.be.equal(claimData.Visitor.Town)
              expect(filteredResults[0][6], 'should contain the visitor county').to.be.equal(claimData.Visitor.County)
              expect(filteredResults[0][7], 'should contain the visitor country').to.be.equal(claimData.Visitor.Country)
              expect(filteredResults[0][8], 'should contain the visitor postcode').to.be.equal(claimData.Visitor.PostCode)
              expect(filteredResults[0][9], 'should contain the reference number').to.be.equal(reference)
            })
        })
    })

    it('should retrieve APPROVED-ADVANCE-CLOSED claim records with payment status of NULL', function () {
      return changeClaimStatus('APPROVED-ADVANCE-CLOSED')
        .then(function () {
          var claimData = testHelper.getClaimData(reference)
          return getTopUpsPendingPayment(paymentMethods.PAYOUT.value)
            .then(function (results) {
              var filteredResults = results.filter(function (result) {
                return result[0] === claimId
              })
              expect(filteredResults.length === 1).to.be.true
              expect(filteredResults[0].length === 10, 'should contain 10 fields').to.be.true
              expect(filteredResults[0][0], 'should contain the claim id').to.be.equal(claimId)
              expect(filteredResults[0][1], 'should contain correct amount (including deductions)').to.be.equal('10.00')
              expect(filteredResults[0][2], 'should contain the visitor first name').to.be.equal(claimData.Visitor.FirstName)
              expect(filteredResults[0][3], 'should contain the visitor last name').to.be.equal(claimData.Visitor.LastName)
              expect(filteredResults[0][4], 'should contain the visitor house number and street').to.be.equal(claimData.Visitor.HouseNumberAndStreet)
              expect(filteredResults[0][5], 'should contain the visitor town').to.be.equal(claimData.Visitor.Town)
              expect(filteredResults[0][6], 'should contain the visitor county').to.be.equal(claimData.Visitor.County)
              expect(filteredResults[0][7], 'should contain the visitor country').to.be.equal(claimData.Visitor.Country)
              expect(filteredResults[0][8], 'should contain the visitor postcode').to.be.equal(claimData.Visitor.PostCode)
              expect(filteredResults[0][9], 'should contain the reference number').to.be.equal(reference)
            })
        })
    })

    it('should not retrieve REJECTED claim records', function () {
      return changeClaimDateApproved(null)
        .then(function () {
          return changeClaimStatus('REJECTED')
            .then(function () {
              return getTopUpsPendingPayment(paymentMethods.PAYOUT.value)
                .then(function (results) {
                  var filteredResults = results.filter(function (result) {
                    return result[0] === claimId
                  })
                  expect(filteredResults.length === 0).to.be.true
                })
            })
        })
    })

    after(function () {
      return testHelper.deleteAll(reference, 'IntSchema')
    })
  })
})
