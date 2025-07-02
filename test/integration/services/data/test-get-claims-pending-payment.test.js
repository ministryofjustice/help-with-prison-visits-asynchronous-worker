const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')
const dateFormatter = require('../../../../app/services/date-formatter')

const paymentMethods = require('../../../../app/constants/payment-method-enum')

const updateClaimTotalAmountStub = jest.fn().mockResolvedValue()
const updateClaimManuallyProcessedAmountStub = jest.fn().mockResolvedValue()

jest.mock('./update-claim-total-amount', () => updateClaimTotalAmountStub)

jest.mock('./update-claim-manually-processed-amount', () => updateClaimManuallyProcessedAmountStub)

describe('services/data/get-claims-pending-payment', () => {
  const reference = 'PAYMENT'
  let claimId
  let claimExpenseId1
  let claimExpenseId2

  const getClaimsPendingPayment = require('../../../../app/services/data/get-claims-pending-payment')

  function beforeDataCreation() {
    const db = getDatabaseConnector()

    return (
      testHelper
        .insertClaimEligibilityData('IntSchema', reference)
        .then(ids => {
          claimId = ids.claimId
        })
        .then(() => {
          return db('IntSchema.Claim').where('ClaimId', claimId).update({
            Status: 'APPROVED',
            DateApproved: dateFormatter.now().toDate(),
          })
        })
        .then(() => {
          return db('IntSchema.ClaimExpense').where('ClaimId', claimId).select('ClaimExpenseId')
        })
        .then(claimExpenses => {
          claimExpenseId1 = claimExpenses[0].ClaimExpenseId
          claimExpenseId2 = claimExpenses[1].ClaimExpenseId

          // Set one expense to REJECTED
          return db('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpenseId1).update('Status', 'REJECTED')
        })
        // Set one expense to APPROVED
        .then(() => {
          return db('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpenseId2).update({
            Status: 'APPROVED',
            ApprovedCost: 25,
          })
        })
    )
  }

  function changeClaimStatus(status) {
    const db = getDatabaseConnector()

    return db('IntSchema.Claim').where('ClaimId', claimId).update('Status', status)
  }

  function changeClaimDateApproved(dateApproved) {
    const db = getDatabaseConnector()

    return db('IntSchema.Claim').where('ClaimId', claimId).update('DateApproved', dateApproved)
  }

  describe('Direct Bank payment', () => {
    beforeAll(() => {
      return beforeDataCreation()
    })

    it('should retrieve only APPROVED claim records with payment status of NULL', () => {
      return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value).then(results => {
        const filteredResults = results.filter(result => {
          return result[0] === claimId
        })
        expect(filteredResults.length === 1).toBe(true)
        // should contain 8 fields
        expect(filteredResults[0].length === 8).toBe(true)
        // should contain the claim id
        expect(filteredResults[0][0]).toBe(claimId)
        // should contain the sort code
        expect(filteredResults[0][1]).toBe('001122')
        // should contain the account number
        expect(filteredResults[0][2]).toBe('00123456')
        // should contain the visitor name
        expect(filteredResults[0][3]).toBe('Joe Bloggs')
        // should contain correct amount (including deductions)
        expect(filteredResults[0][4]).toBe('10.00')
        // should contain the reference
        expect(filteredResults[0][5]).toBe(reference)
        // should contain the country
        expect(filteredResults[0][6]).toBe('Northern Ireland')
        // should contain the roll number
        expect(filteredResults[0][7]).toBe('ROLL-1BE.R')
      })
    })

    it('should exclude manually processed expense costs from the amount paid', () => {
      const db = getDatabaseConnector()

      const update1 = db('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpenseId1).update({
        ApprovedCost: '20.50',
        Status: 'APPROVED-DIFF-AMOUNT',
      })
      const update2 = db('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpenseId2).update({
        ApprovedCost: '4.55',
        Status: 'MANUALLY-PROCESSED',
      })

      return Promise.all([update1, update2]).then(() => {
        return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value).then(results => {
          const filteredResults = results.filter(result => {
            return result[0] === claimId
          })

          // Total approved amount: £25.05. Payment amount: £25.05 - £15 (deduction) - £4.55 (Manually processed) = £5.50
          // should return correct amount (excluding manually processed expenses)
          expect(filteredResults[0][4]).toBe('5.50')
        })
      })
    })

    it('should call update claim total amount with the correct value', () => {
      const db = getDatabaseConnector()

      const update1 = db('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpenseId1).update({
        ApprovedCost: '15',
        Status: 'APPROVED-DIFF-AMOUNT',
      })
      const update2 = db('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpenseId2).update({
        ApprovedCost: '15',
        Status: 'MANUALLY-PROCESSED',
      })
      return Promise.all([update1, update2]).then(() => {
        return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value).then(() => {
          // Total approved amount: £30. Total amount: £30 - £15 (deduction) = £15
          // should update total amount with correct value
          expect(updateClaimTotalAmountStub).toHaveBeenCalledWith(claimId, 15).toBe(true)
        })
      })
    })

    it('should call update claim manually processed amount the with correct value', () => {
      const db = getDatabaseConnector()

      const update1 = db('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpenseId1).update({
        ApprovedCost: '10',
        Status: 'MANUALLY-PROCESSED',
      })
      const update2 = db('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpenseId2).update({
        ApprovedCost: '15',
        Status: 'MANUALLY-PROCESSED',
      })
      return Promise.all([update1, update2]).then(() => {
        return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value).then(() => {
          // should update manually processed amount with correct value
          expect(updateClaimManuallyProcessedAmountStub).toHaveBeenCalledWith(claimId, 25).toBe(true)
        })
      })
    })

    it('should call update claim manually processed amount the with correct value given a decimal value', () => {
      const db = getDatabaseConnector()

      const update1 = db('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpenseId1).update({
        ApprovedCost: '10.20',
        Status: 'MANUALLY-PROCESSED',
      })
      const update2 = db('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpenseId2).update({
        ApprovedCost: '15',
        Status: 'MANUALLY-PROCESSED',
      })
      return Promise.all([update1, update2]).then(() => {
        return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value).then(() => {
          // should update manually processed amount with correct value
          expect(updateClaimManuallyProcessedAmountStub).toHaveBeenCalledWith(claimId, 25.2).toBe(true)
        })
      })
    })

    it('should return payment amount to two decimal places', () => {
      const db = getDatabaseConnector()

      const update1 = db('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpenseId1).update({
        ApprovedCost: '20.65',
        Status: 'APPROVED',
      })
      const update2 = db('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpenseId2).update({
        ApprovedCost: '10.45',
        Status: 'MANUALLY-PROCESSED',
      })

      return Promise.all([update1, update2]).then(() => {
        return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value).then(results => {
          const filteredResults = results.filter(result => {
            return result[0] === claimId
          })

          // Total approved amount: £31.10. Payment amount: £31.10 - £15 (deduction) - £10.45 (Manually processed) = £5.65
          // should return correct amount (excluding manually processed expenses)
          expect(filteredResults[0][4]).toBe('5.65')
        })
      })
    })

    it('should not return claims to be paid if PaymentAmount is not positive', () => {
      const db = getDatabaseConnector()

      const update1 = db('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpenseId1).update({
        ApprovedCost: '15',
        Status: 'APPROVED',
      })
      const update2 = db('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpenseId2).update({
        ApprovedCost: '15',
        Status: 'MANUALLY-PROCESSED',
      })

      return Promise.all([update1, update2]).then(() => {
        return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value).then(results => {
          const filteredResults = results.filter(result => {
            return result[0] === claimId
          })

          // Total approved amount: £30. Payment amount: £30 - £15 (deduction) - £15 (Manually processed) = £0.00
          // should not return claims to be paid given PaymentAmount of 0
          expect(filteredResults.length).toBe(0)
        })
      })
    })

    it('should retrieve not retrieve claims with a PaymentMethod of manually processed', () => {
      const db = getDatabaseConnector()

      return db('IntSchema.Claim')
        .where('ClaimId', claimId)
        .update({ PaymentMethod: paymentMethods.MANUALLY_PROCESSED.value })
        .then(() => {
          return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
        })
        .then(results => {
          const filteredResults = results.filter(result => {
            return result[0] === claimId
          })

          expect(filteredResults.length === 0)
        })
    })

    afterAll(() => {
      return testHelper.deleteAll(reference, 'IntSchema')
    })
  })

  describe('Payout payments', () => {
    beforeAll(() => {
      const db = getDatabaseConnector()

      return beforeDataCreation()
        .then(() => {
          return db('IntSchema.Claim').where('ClaimId', claimId).update('PaymentMethod', paymentMethods.PAYOUT.value)
        })
        .then(() => {
          return db('IntSchema.ClaimBankDetail').where('ClaimId', claimId).del()
        })
    })
    it('should retrieve only APPROVED claim records with payment status of NULL', () => {
      const claimData = testHelper.getClaimData(reference)
      return getClaimsPendingPayment(paymentMethods.PAYOUT.value).then(results => {
        const filteredResults = results.filter(result => {
          return result[0] === claimId
        })
        expect(filteredResults.length === 1).toBe(true)
        // should contain the claim id
        expect(filteredResults[0][0]).toBe(claimId)
        // should contain correct amount (including deductions)
        expect(filteredResults[0][1]).toBe('10.00')
        // should contain the visitor first name
        expect(filteredResults[0][2]).toBe(claimData.Visitor.FirstName)
        // should contain the visitor last name
        expect(filteredResults[0][3]).toBe(claimData.Visitor.LastName)
        // should contain the visitor house number and street
        expect(filteredResults[0][4]).toBe(claimData.Visitor.HouseNumberAndStreet)
        // should contain the visitor town
        expect(filteredResults[0][5]).toBe(claimData.Visitor.Town)
        // should contain the visitor county
        expect(filteredResults[0][6]).toBe(claimData.Visitor.County)
        // should contain the visitor country
        expect(filteredResults[0][7]).toBe(claimData.Visitor.Country)
        // should contain the visitor postcode
        expect(filteredResults[0][8]).toBe(claimData.Visitor.PostCode)
        // should contain the reference number
        expect(filteredResults[0][9]).toBe(reference)
      })
    })

    it('should retrieve UPDATED claim records with payment status of NULL', () => {
      return changeClaimStatus('UPDATED').then(() => {
        const claimData = testHelper.getClaimData(reference)
        return getClaimsPendingPayment(paymentMethods.PAYOUT.value).then(results => {
          const filteredResults = results.filter(result => {
            return result[0] === claimId
          })
          expect(filteredResults.length === 1).toBe(true)
          // should contain the claim id
          expect(filteredResults[0][0]).toBe(claimId)
          // should contain correct amount (including deductions)
          expect(filteredResults[0][1]).toBe('10.00')
          // should contain the visitor first name
          expect(filteredResults[0][2]).toBe(claimData.Visitor.FirstName)
          // should contain the visitor last name
          expect(filteredResults[0][3]).toBe(claimData.Visitor.LastName)
          // should contain the visitor house number and street
          expect(filteredResults[0][4]).toBe(claimData.Visitor.HouseNumberAndStreet)
          // should contain the visitor town
          expect(filteredResults[0][5]).toBe(claimData.Visitor.Town)
          // should contain the visitor county
          expect(filteredResults[0][6]).toBe(claimData.Visitor.County)
          // should contain the visitor country
          expect(filteredResults[0][7]).toBe(claimData.Visitor.Country)
          // should contain the visitor postcode
          expect(filteredResults[0][8]).toBe(claimData.Visitor.PostCode)
          // should contain the reference number
          expect(filteredResults[0][9]).toBe(reference)
        })
      })
    })

    it('should retrieve APPROVED-ADVANCE-CLOSED claim records with payment status of NULL', () => {
      return changeClaimStatus('APPROVED-ADVANCE-CLOSED').then(() => {
        const claimData = testHelper.getClaimData(reference)
        return getClaimsPendingPayment(paymentMethods.PAYOUT.value).then(results => {
          const filteredResults = results.filter(result => {
            return result[0] === claimId
          })
          expect(filteredResults.length === 1).toBe(true)
          // should contain the claim id
          expect(filteredResults[0][0]).toBe(claimId)
          // should contain correct amount (including deductions)
          expect(filteredResults[0][1]).toBe('10.00')
          // should contain the visitor first name
          expect(filteredResults[0][2]).toBe(claimData.Visitor.FirstName)
          // should contain the visitor last name
          expect(filteredResults[0][3]).toBe(claimData.Visitor.LastName)
          // should contain the visitor house number and street
          expect(filteredResults[0][4]).toBe(claimData.Visitor.HouseNumberAndStreet)
          // should contain the visitor town
          expect(filteredResults[0][5]).toBe(claimData.Visitor.Town)
          // should contain the visitor county
          expect(filteredResults[0][6]).toBe(claimData.Visitor.County)
          // should contain the visitor country
          expect(filteredResults[0][7]).toBe(claimData.Visitor.Country)
          // should contain the visitor postcode
          expect(filteredResults[0][8]).toBe(claimData.Visitor.PostCode)
          // should contain the reference number
          expect(filteredResults[0][9]).toBe(reference)
        })
      })
    })

    it('should not retrieve REJECTED claim records', () => {
      return changeClaimDateApproved(null).then(() => {
        return changeClaimStatus('REJECTED').then(() => {
          return getClaimsPendingPayment(paymentMethods.PAYOUT.value).then(results => {
            const filteredResults = results.filter(result => {
              return result[0] === claimId
            })
            expect(filteredResults.length === 0).toBe(true)
          })
        })
      })
    })

    afterAll(() => {
      return testHelper.deleteAll(reference, 'IntSchema')
    })
  })
})
