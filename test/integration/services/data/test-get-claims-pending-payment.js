const expect = require('chai').expect
const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const moment = require('moment')
const testHelper = require('../../../test-helper')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

describe('services/data/get-claims-pending-payment', function () {
  var reference = 'PAYMENT'
  var claimId
  var claimExpenseId1
  var claimExpenseId2

  var updateClaimTotalAmountStub = sinon.stub().resolves()

  const getClaimsPendingPayment = proxyquire('../../../../app/services/data/get-claims-pending-payment', {
    './update-claim-total-amount': updateClaimTotalAmountStub
  })

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

  it('should retrieve claim records with payment status of NULL', function () {
    var currentDate = moment().format('YYYY-MM-DD')
    return getClaimsPendingPayment()
      .then(function (results) {
        var filteredResults = results.filter(function (result) {
          return result[0] === claimId
        })

        expect(filteredResults.length === 1)
        expect(filteredResults[0][0].length === 6, 'should contain 6 fields')
        expect(filteredResults[0][0], 'should contain the claim id').to.be.equal(claimId)
        expect(filteredResults[0][1], 'should contain the sort code').to.be.equal('001122')
        expect(filteredResults[0][2], 'should contain the account number').to.be.equal('00123456')
        expect(filteredResults[0][3], 'should contain the visitor name').to.be.equal('Joe Bloggs')
        expect(filteredResults[0][4], 'should contain correct amount (including deductions)').to.be.equal('10')
        expect(filteredResults[0][5], 'should contain the reference and date of journey').to.be.equal(`${reference} ${currentDate}`)
      })
  })

  it('should exclude manually processed expense costs from the amount paid', function () {
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
    Promise.all([update1, update2])
      .then(function () {
        return getClaimsPendingPayment()
          .then(function (results) {
            var filteredResults = results.filter(function (result) {
              return result[0] === claimId
            })
            expect(filteredResults[0][4], 'should return correct amount (excluding manually processed expenses)').to.be.equal('15')
          })
      })
  })

  it('should call update payment amount manually processed with total claim amount', function () {
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
    Promise.all([update1, update2])
      .then(function () {
        return getClaimsPendingPayment()
          .then(function () {
            expect(updateClaimTotalAmountStub.calledWith(claimId, 15), 'should update total amount with correct value').to.be.true
          })
      })
  })

  after(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
