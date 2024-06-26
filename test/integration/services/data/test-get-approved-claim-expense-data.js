const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const testHelper = require('../../../test-helper')

const getApprovedClaimExpenseData = require('../../../../app/services/data/get-approved-claim-expense-data')

describe('services/data/get-approved-claim-expense-data', function () {
  const reference = 'DWPVISI'
  let claimId
  let claimExpenseId1
  let claimExpenseId2
  let testData

  beforeAll(function () {
    const db = getDatabaseConnector()

    return (
      testHelper
        .insertClaimEligibilityData('IntSchema', reference)
        .then(function (ids) {
          claimId = ids.claimId
          testData = testHelper.getClaimData(reference, claimId)
        })
        .then(function () {
          return db('IntSchema.ClaimExpense').where('ClaimId', claimId).select('ClaimExpenseId')
        })
        .then(function (claimExpenses) {
          claimExpenseId1 = claimExpenses[0].ClaimExpenseId
          claimExpenseId2 = claimExpenses[1].ClaimExpenseId

          // Set one expense to REJECTED
          return db('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpenseId1).update('Status', 'REJECTED')
        })
        // Set one expense to APPROVED
        .then(function () {
          return db('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpenseId2).update({
            Status: 'APPROVED',
            ApprovedCost: 20,
          })
        })
    )
  })

  it('should retrieve only claim expenses relating to the claim with the specified reference and claim id', function () {
    return getApprovedClaimExpenseData(claimId).then(function (result) {
      const db = getDatabaseConnector()

      expect(result.claimantData.VisitorFirstName).toBe(testData.Visitor.FirstName)
      expect(result.claimantData.PaymentMethod).toBe(testData.Claim.PaymentMethod)
      expect(result.claimantData.AccountNumberLastFourDigits).toBe(
        testData.ClaimBankDetail.AccountNumber.substr(testData.ClaimBankDetail.AccountNumber.length - 4),
      )
      expect(result.claimantData.CaseworkerNote).toBe('')
      expect(result.claimantData.Town).toBe(testData.Visitor.Town)
      expect(result.claimantData.Prison).toBe(testData.Prisoner.NameOfPrison)
      expect(result.claimantData.IsAdvanceClaim).toBe(testData.Claim.IsAdvanceClaim)
      return db('IntSchema.ClaimExpense')
        .where('ClaimExpenseId', claimExpenseId1)
        .first()
        .then(function (claimExpense) {
          expect(claimExpense.Status).toBe('REJECTED')
        })
        .then(function () {
          return db('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpenseId2).first()
        })
        .then(function (claimExpense) {
          expect(claimExpense.Status).toBe('APPROVED')
        })
    })
  })

  afterAll(function () {
    return testHelper.deleteAll(reference, 'IntSchema')
  })
})
