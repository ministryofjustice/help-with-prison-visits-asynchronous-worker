/* eslint-disable func-names */
const { getDatabaseConnector } = require('../../databaseConnector')
const claimStatuses = require('../../constants/claim-status-enum')
const claimExpenseStatuses = require('../../constants/claim-expense-status-enum')
const updateClaimTotalAmount = require('./update-claim-total-amount')
const updateClaimManuallyProcessedAmount = require('./update-claim-manually-processed-amount')
const paymentMethods = require('../../constants/payment-method-enum')

const directBankColumns = [
  'IntSchema.Claim.ClaimId',
  'IntSchema.ClaimBankDetail.SortCode',
  'IntSchema.ClaimBankDetail.AccountNumber',
  'IntSchema.Visitor.FirstName',
  'IntSchema.Visitor.LastName',
  'IntSchema.Claim.Reference',
  'IntSchema.Claim.DateOfJourney',
  'IntSchema.Visitor.Country',
  'IntSchema.ClaimBankDetail.NameOnAccount',
  'IntSchema.ClaimBankDetail.RollNumber',
]

const payoutColumns = [
  'IntSchema.Claim.ClaimId',
  'IntSchema.Visitor.FirstName',
  'IntSchema.Visitor.LastName',
  'IntSchema.Visitor.HouseNumberAndStreet',
  'IntSchema.Visitor.Town',
  'IntSchema.Visitor.County',
  'IntSchema.Visitor.Country',
  'IntSchema.Visitor.PostCode',
  'IntSchema.Visitor.Reference',
  'IntSchema.Claim.DateOfJourney',
]

function getManuallyProcessedExpenseCostsPerClaim(claimIds) {
  const db = getDatabaseConnector()

  return db('IntSchema.ClaimExpense')
    .sum('ApprovedCost as ManuallyProcessedCost')
    .select('ClaimId')
    .groupBy('ClaimId')
    .where('Status', 'MANUALLY-PROCESSED')
    .whereIn('ClaimId', claimIds)
}

function subtractManuallyProcessedExpenseCosts(manuallyProcessedExpenseCostsPerClaim, claimResults) {
  const promises = []

  claimResults.forEach(claim => {
    const totalAmount = claim.TotalApprovedCost - (claim.TotalDeductionAmount || 0)
    claim.PaymentAmount = totalAmount
    manuallyProcessedExpenseCostsPerClaim.forEach(manuallyProcessedExpenseCost => {
      if (claim.ClaimId === manuallyProcessedExpenseCost.ClaimId) {
        claim.PaymentAmount = totalAmount - manuallyProcessedExpenseCost.ManuallyProcessedCost
        promises.push(
          updateClaimManuallyProcessedAmount(claim.ClaimId, manuallyProcessedExpenseCost.ManuallyProcessedCost),
        )
      }
    })
    promises.push(updateClaimTotalAmount(claim.ClaimId, totalAmount))
  })
  return Promise.all(promises).then(() => {
    const claimsWithPositivePaymentAmount = claimResults.filter(claim => {
      return claim.PaymentAmount > 0
    })
    return claimsWithPositivePaymentAmount
  })
}

function directPaymentsReturn(results) {
  return results.map(record => {
    return [
      record.ClaimId,
      record.SortCode,
      record.AccountNumber,
      record.NameOnAccount,
      record.PaymentAmount.toFixed(2),
      record.Reference,
      record.Country,
      record.RollNumber,
    ]
  })
}

function payoutPaymentsReturn(results) {
  return results.map(record => {
    return [
      record.ClaimId,
      record.PaymentAmount.toFixed(2),
      record.FirstName,
      record.LastName,
      record.HouseNumberAndStreet,
      record.Town,
      record.County,
      record.Country,
      record.PostCode,
      record.Reference,
      record.DateOfJourney,
    ]
  })
}

module.exports = paymentMethod => {
  let claimResults
  const rawDeductionTotalQuery =
    '(SELECT SUM(Amount) FROM IntSchema.ClaimDeduction ' +
    'WHERE IntSchema.ClaimDeduction.ClaimId = IntSchema.Claim.ClaimId ' +
    'AND IntSchema.ClaimDeduction.IsEnabled = 1) ' +
    'AS TotalDeductionAmount'
  const selectColumns = paymentMethod === paymentMethods.DIRECT_BANK_PAYMENT.value ? directBankColumns : payoutColumns
  const db = getDatabaseConnector()

  return db('IntSchema.Claim')
    .column(db.raw(rawDeductionTotalQuery))
    .sum('IntSchema.ClaimExpense.ApprovedCost as TotalApprovedCost')
    .select(selectColumns)
    .leftJoin('IntSchema.ClaimBankDetail', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimBankDetail.ClaimId')
    .innerJoin('IntSchema.Visitor', 'IntSchema.Claim.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
    .innerJoin('IntSchema.ClaimExpense', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimExpense.ClaimId')
    .where(function () {
      this.whereIn('IntSchema.Claim.Status', [claimStatuses.APPROVED, claimStatuses.AUTOAPPROVED]).orWhereNotNull(
        'IntSchema.Claim.DateApproved',
      )
    })
    .whereIn('IntSchema.ClaimExpense.Status', [
      claimExpenseStatuses.APPROVED,
      claimExpenseStatuses.APPROVED_DIFF_AMOUNT,
      claimExpenseStatuses.MANUALLY_PROCESSED,
    ])
    .where('IntSchema.Claim.PaymentMethod', paymentMethod)
    .whereNull('IntSchema.Claim.PaymentStatus')
    .groupBy(selectColumns)
    .then(claims => {
      const claimIds = []
      claims.forEach(result => {
        return claimIds.push(result.ClaimId)
      })
      claimResults = claims
      return getManuallyProcessedExpenseCostsPerClaim(claimIds)
    })
    .then(manuallyProcessedExpenseCostsPerClaim => {
      return subtractManuallyProcessedExpenseCosts(manuallyProcessedExpenseCostsPerClaim, claimResults)
    })
    .then(results => {
      return paymentMethod === paymentMethods.DIRECT_BANK_PAYMENT.value
        ? directPaymentsReturn(results)
        : payoutPaymentsReturn(results)
    })
}
