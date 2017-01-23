const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const dateFormatter = require('../../../../app/services/date-formatter')
const testHelper = require('../../../test-helper')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')
const paymentMethods = require('../../../../app/constants/payment-method-enum')

describe('services/data/get-claims-pending-payment', function () {
  var reference = 'PAYMENT'
  var claimId
  var claimExpenseId1
  var claimExpenseId2

  var updateClaimTotalAmountStub = sinon.stub().resolves()
  var updateClaimManuallyProcessedAmountStub = sinon.stub().resolves()

  const getClaimsPendingPayment = proxyquire('../../../../app/services/data/get-claims-pending-payment', {
    './update-claim-total-amount': updateClaimTotalAmountStub,
    './update-claim-manually-processed-amount': updateClaimManuallyProcessedAmountStub
  })

  before(function () {
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

  it('should retrieve only APPROVED claim records with payment status of NULL', function () {
    var currentDate = dateFormatter.now().format('YYYY-MM-DD')
    return getClaimsPendingPayment()
      .then(function (results) {
        var filteredResults = results.filter(function (result) {
          return result[0] === claimId
        })

        expect(filteredResults.length === 1).to.be.true
        expect(filteredResults[0].length === 6, 'should contain 6 fields').to.be.true
        expect(filteredResults[0][0], 'should contain the claim id').to.be.equal(claimId)
        expect(filteredResults[0][1], 'should contain the sort code').to.be.equal('001122')
        expect(filteredResults[0][2], 'should contain the account number').to.be.equal('00123456')
        expect(filteredResults[0][3], 'should contain the visitor name').to.be.equal('Joe Bloggs')
        expect(filteredResults[0][4], 'should contain correct amount (including deductions)').to.be.equal('10.00')
        expect(filteredResults[0][5], 'should contain the reference and date of journey').to.be.equal(`${reference} ${currentDate}`)
      })
  })

  it('should exclude manually processed expense costs from the amount paid', function () {
    var update1 = knex('IntSchema.ClaimExpense')
      .where('ClaimExpenseId', claimExpenseId1)
      .update({
        ApprovedCost: '20.50',
        Status: 'APPROVED-DIFF-AMOUNT'
      })
    var update2 = knex('IntSchema.ClaimExpense')
      .where('ClaimExpenseId', claimExpenseId2)
      .update({
        ApprovedCost: '4.55',
        Status: 'MANUALLY-PROCESSED'
      })

    return Promise.all([update1, update2])
      .then(function () {
        return getClaimsPendingPayment()
          .then(function (results) {
            var filteredResults = results.filter(function (result) {
              return result[0] === claimId
            })

            // Total approved amount: £25.05. Payment amount: £25.05 - £15 (deduction) - £4.55 (Manually processed) = £5.50
            expect(filteredResults[0][4], 'should return correct amount (excluding manually processed expenses)').to.equal('5.50')
          })
      })
  })

  it('should call update claim total amount with the correct value', function () {
    var update1 = knex('IntSchema.ClaimExpense')
      .where('ClaimExpenseId', claimExpenseId1)
      .update({
        ApprovedCost: '15',
        Status: 'APPROVED-DIFF-AMOUNT'
      })
    var update2 = knex('IntSchema.ClaimExpense')
      .where('ClaimExpenseId', claimExpenseId2)
      .update({
        ApprovedCost: '15',
        Status: 'MANUALLY-PROCESSED'
      })
    return Promise.all([update1, update2])
      .then(function () {
        return getClaimsPendingPayment()
          .then(function () {
            // Total approved amount: £30. Total amount: £30 - £15 (deduction) = £15
            expect(updateClaimTotalAmountStub.calledWith(claimId, 15), 'should update total amount with correct value').to.be.true
          })
      })
  })

  it('should call update claim manually processed amount the with correct value', function () {
    var update1 = knex('IntSchema.ClaimExpense')
      .where('ClaimExpenseId', claimExpenseId1)
      .update({
        ApprovedCost: '10',
        Status: 'MANUALLY-PROCESSED'
      })
    var update2 = knex('IntSchema.ClaimExpense')
      .where('ClaimExpenseId', claimExpenseId2)
      .update({
        ApprovedCost: '15',
        Status: 'MANUALLY-PROCESSED'
      })
    return Promise.all([update1, update2])
      .then(function () {
        return getClaimsPendingPayment()
          .then(function () {
            expect(updateClaimManuallyProcessedAmountStub.calledWith(claimId, 25), 'should update manually processed amount with correct value').to.be.true
          })
      })
  })

  it('should call update claim manually processed amount the with correct value given a decimal value', function () {
    var update1 = knex('IntSchema.ClaimExpense')
      .where('ClaimExpenseId', claimExpenseId1)
      .update({
        ApprovedCost: '10.20',
        Status: 'MANUALLY-PROCESSED'
      })
    var update2 = knex('IntSchema.ClaimExpense')
      .where('ClaimExpenseId', claimExpenseId2)
      .update({
        ApprovedCost: '15',
        Status: 'MANUALLY-PROCESSED'
      })
    return Promise.all([update1, update2])
      .then(function () {
        return getClaimsPendingPayment()
          .then(function () {
            expect(updateClaimManuallyProcessedAmountStub.calledWith(claimId, 25.20), 'should update manually processed amount with correct value').to.be.true
          })
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
        return getClaimsPendingPayment()
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
        return getClaimsPendingPayment()
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
        return getClaimsPendingPayment()
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
