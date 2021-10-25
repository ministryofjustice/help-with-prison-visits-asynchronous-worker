const expect = require('chai').expect
const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const dateFormatter = require('../../../../app/services/date-formatter')

const paymentMethods = require('../../../../app/constants/payment-method-enum')

describe('services/data/get-claims-pending-payment', function () {
  const reference = 'PAYMENT'
  let claimId
  let claimExpenseId1
  let claimExpenseId2

  const updateClaimTotalAmountStub = sinon.stub().resolves()
  const updateClaimManuallyProcessedAmountStub = sinon.stub().resolves()

  const getClaimsPendingPayment = proxyquire('../../../../app/services/data/get-claims-pending-payment', {
    './update-claim-total-amount': updateClaimTotalAmountStub,
    './update-claim-manually-processed-amount': updateClaimManuallyProcessedAmountStub
  })

  function beforeDataCreation () {
    const db = getDatabaseConnector()

    return testHelper.insertClaimEligibilityData('IntSchema', reference)
      .then(function (ids) {
        claimId = ids.claimId
      })
      .then(function () {
        return db('IntSchema.Claim')
          .where('ClaimId', claimId)
          .update({
            Status: 'APPROVED',
            DateApproved: dateFormatter.now().toDate()
          })
      })
      .then(function () {
        return db('IntSchema.ClaimExpense')
          .where('ClaimId', claimId)
          .select('ClaimExpenseId')
      })
      .then(function (claimExpenses) {
        claimExpenseId1 = claimExpenses[0].ClaimExpenseId
        claimExpenseId2 = claimExpenses[1].ClaimExpenseId

        // Set one expense to REJECTED
        return db('IntSchema.ClaimExpense')
          .where('ClaimExpenseId', claimExpenseId1)
          .update('Status', 'REJECTED')
      })
      // Set one expense to APPROVED
      .then(function () {
        return db('IntSchema.ClaimExpense')
          .where('ClaimExpenseId', claimExpenseId2)
          .update({
            Status: 'APPROVED',
            ApprovedCost: 25
          })
      })
  }

  function changeClaimStatus (status) {
    const db = getDatabaseConnector()

    return db('IntSchema.Claim')
      .where('ClaimId', claimId)
      .update('Status', status)
  }

  function changeClaimDateApproved (dateApproved) {
    const db = getDatabaseConnector()

    return db('IntSchema.Claim')
      .where('ClaimId', claimId)
      .update('DateApproved', dateApproved)
  }

  describe('Direct Bank payment', function () {
    before(function () {
      return beforeDataCreation()
    })

    it('should retrieve only APPROVED claim records with payment status of NULL', function () {
      return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
        .then(function (results) {
          const filteredResults = results.filter(function (result) {
            return result[0] === claimId
          })
          expect(filteredResults.length === 1).to.be.true //eslint-disable-line
          expect(filteredResults[0].length === 8, 'should contain 8 fields').to.be.true //eslint-disable-line
          expect(filteredResults[0][0], 'should contain the claim id').to.be.equal(claimId)
          expect(filteredResults[0][1], 'should contain the sort code').to.be.equal('001122')
          expect(filteredResults[0][2], 'should contain the account number').to.be.equal('00123456')
          expect(filteredResults[0][3], 'should contain the visitor name').to.be.equal('Joe Bloggs')
          expect(filteredResults[0][4], 'should contain correct amount (including deductions)').to.be.equal('10.00')
          expect(filteredResults[0][5], 'should contain the reference').to.be.equal(reference)
          expect(filteredResults[0][6], 'should contain the country').to.be.equal('Northern Ireland')
          expect(filteredResults[0][7], 'should contain the roll number').to.be.equal('ROLL-1BE.R')
        })
    })

    it('should exclude manually processed expense costs from the amount paid', function () {
      const db = getDatabaseConnector()

      const update1 = db('IntSchema.ClaimExpense')
        .where('ClaimExpenseId', claimExpenseId1)
        .update({
          ApprovedCost: '20.50',
          Status: 'APPROVED-DIFF-AMOUNT'
        })
      const update2 = db('IntSchema.ClaimExpense')
        .where('ClaimExpenseId', claimExpenseId2)
        .update({
          ApprovedCost: '4.55',
          Status: 'MANUALLY-PROCESSED'
        })

      return Promise.all([update1, update2])
        .then(function () {
          return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
            .then(function (results) {
              const filteredResults = results.filter(function (result) {
                return result[0] === claimId
              })

              // Total approved amount: £25.05. Payment amount: £25.05 - £15 (deduction) - £4.55 (Manually processed) = £5.50
              expect(filteredResults[0][4], 'should return correct amount (excluding manually processed expenses)').to.equal('5.50')
            })
        })
    })

    it('should call update claim total amount with the correct value', function () {
      const db = getDatabaseConnector()

      const update1 = db('IntSchema.ClaimExpense')
        .where('ClaimExpenseId', claimExpenseId1)
        .update({
          ApprovedCost: '15',
          Status: 'APPROVED-DIFF-AMOUNT'
        })
      const update2 = db('IntSchema.ClaimExpense')
        .where('ClaimExpenseId', claimExpenseId2)
        .update({
          ApprovedCost: '15',
          Status: 'MANUALLY-PROCESSED'
        })
      return Promise.all([update1, update2])
        .then(function () {
          return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
            .then(function () {
              // Total approved amount: £30. Total amount: £30 - £15 (deduction) = £15
              expect(updateClaimTotalAmountStub.calledWith(claimId, 15), 'should update total amount with correct value').to.be.true //eslint-disable-line
            })
        })
    })

    it('should call update claim manually processed amount the with correct value', function () {
      const db = getDatabaseConnector()

      const update1 = db('IntSchema.ClaimExpense')
        .where('ClaimExpenseId', claimExpenseId1)
        .update({
          ApprovedCost: '10',
          Status: 'MANUALLY-PROCESSED'
        })
      const update2 = db('IntSchema.ClaimExpense')
        .where('ClaimExpenseId', claimExpenseId2)
        .update({
          ApprovedCost: '15',
          Status: 'MANUALLY-PROCESSED'
        })
      return Promise.all([update1, update2])
        .then(function () {
          return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
            .then(function () {
              expect(updateClaimManuallyProcessedAmountStub.calledWith(claimId, 25), 'should update manually processed amount with correct value').to.be.true //eslint-disable-line
            })
        })
    })

    it('should call update claim manually processed amount the with correct value given a decimal value', function () {
      const db = getDatabaseConnector()

      const update1 = db('IntSchema.ClaimExpense')
        .where('ClaimExpenseId', claimExpenseId1)
        .update({
          ApprovedCost: '10.20',
          Status: 'MANUALLY-PROCESSED'
        })
      const update2 = db('IntSchema.ClaimExpense')
        .where('ClaimExpenseId', claimExpenseId2)
        .update({
          ApprovedCost: '15',
          Status: 'MANUALLY-PROCESSED'
        })
      return Promise.all([update1, update2])
        .then(function () {
          return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
            .then(function () {
              expect(updateClaimManuallyProcessedAmountStub.calledWith(claimId, 25.20), 'should update manually processed amount with correct value').to.be.true //eslint-disable-line
            })
        })
    })

    it('should return payment amount to two decimal places', function () {
      const db = getDatabaseConnector()

      const update1 = db('IntSchema.ClaimExpense')
        .where('ClaimExpenseId', claimExpenseId1)
        .update({
          ApprovedCost: '20.65',
          Status: 'APPROVED'
        })
      const update2 = db('IntSchema.ClaimExpense')
        .where('ClaimExpenseId', claimExpenseId2)
        .update({
          ApprovedCost: '10.45',
          Status: 'MANUALLY-PROCESSED'
        })

      return Promise.all([update1, update2])
        .then(function () {
          return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
            .then(function (results) {
              const filteredResults = results.filter(function (result) {
                return result[0] === claimId
              })

              // Total approved amount: £31.10. Payment amount: £31.10 - £15 (deduction) - £10.45 (Manually processed) = £5.65
              expect(filteredResults[0][4], 'should return correct amount (excluding manually processed expenses)').to.equal('5.65')
            })
        })
    })

    it('should not return claims to be paid if PaymentAmount is not positive', function () {
      const db = getDatabaseConnector()

      const update1 = db('IntSchema.ClaimExpense')
        .where('ClaimExpenseId', claimExpenseId1)
        .update({
          ApprovedCost: '15',
          Status: 'APPROVED'
        })
      const update2 = db('IntSchema.ClaimExpense')
        .where('ClaimExpenseId', claimExpenseId2)
        .update({
          ApprovedCost: '15',
          Status: 'MANUALLY-PROCESSED'
        })

      return Promise.all([update1, update2])
        .then(function () {
          return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
            .then(function (results) {
              const filteredResults = results.filter(function (result) {
                return result[0] === claimId
              })

              // Total approved amount: £30. Payment amount: £30 - £15 (deduction) - £15 (Manually processed) = £0.00
              expect(filteredResults.length, 'should not return claims to be paid given PaymentAmount of 0').to.equal(0)
            })
        })
    })

    it('should retrieve not retrieve claims with a PaymentMethod of manually processed', function () {
      const db = getDatabaseConnector()

      return db('IntSchema.Claim')
        .where('ClaimId', claimId)
        .update({ PaymentMethod: paymentMethods.MANUALLY_PROCESSED.value })
        .then(function () {
          return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
        })
        .then(function (results) {
          const filteredResults = results.filter(function (result) {
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
      const db = getDatabaseConnector()

      return beforeDataCreation()
        .then(function () {
          return db('IntSchema.Claim')
            .where('ClaimId', claimId)
            .update('PaymentMethod', paymentMethods.PAYOUT.value)
        })
        .then(function () {
          return db('IntSchema.ClaimBankDetail')
            .where('ClaimId', claimId)
            .del()
        })
    })
    it('should retrieve only APPROVED claim records with payment status of NULL', function () {
      const claimData = testHelper.getClaimData(reference)
      return getClaimsPendingPayment(paymentMethods.PAYOUT.value)
        .then(function (results) {
          const filteredResults = results.filter(function (result) {
            return result[0] === claimId
          })
          expect(filteredResults.length === 1).to.be.true //eslint-disable-line
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
          const claimData = testHelper.getClaimData(reference)
          return getClaimsPendingPayment(paymentMethods.PAYOUT.value)
            .then(function (results) {
              const filteredResults = results.filter(function (result) {
                return result[0] === claimId
              })
              expect(filteredResults.length === 1).to.be.true //eslint-disable-line
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
          const claimData = testHelper.getClaimData(reference)
          return getClaimsPendingPayment(paymentMethods.PAYOUT.value)
            .then(function (results) {
              const filteredResults = results.filter(function (result) {
                return result[0] === claimId
              })
              expect(filteredResults.length === 1).to.be.true //eslint-disable-line
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
              return getClaimsPendingPayment(paymentMethods.PAYOUT.value)
                .then(function (results) {
                  const filteredResults = results.filter(function (result) {
                    return result[0] === claimId
                  })
                  expect(filteredResults.length === 0).to.be.true //eslint-disable-line
                })
            })
        })
    })

    after(function () {
      return testHelper.deleteAll(reference, 'IntSchema')
    })
  })
})
