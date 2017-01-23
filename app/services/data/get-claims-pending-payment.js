const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const _ = require('lodash')
const moment = require('moment')
const claimStatuses = require('../../constants/claim-status-enum')
const claimExpenseStatuses = require('../../constants/claim-expense-status-enum')
const updateClaimTotalAmount = require('./update-claim-total-amount')
const updateClaimManuallyProcessedAmount = require('./update-claim-manually-processed-amount')
const paymentMethods = require('../../constants/payment-method-enum')

const selectColumns = ['IntSchema.Claim.ClaimId', 'IntSchema.ClaimBankDetail.SortCode', 'IntSchema.ClaimBankDetail.AccountNumber',
  'IntSchema.Visitor.FirstName', 'IntSchema.Visitor.LastName', 'IntSchema.Claim.Reference', 'IntSchema.Claim.DateOfJourney']

var claimResults

function getManuallyProcessedExpenseCostsPerClaim (claims) {
  var claimIds = []
  claims.forEach(function (result) { return claimIds.push(result.ClaimId) })
  claimResults = claims
  return knex('IntSchema.ClaimExpense')
    .sum('ApprovedCost as ManuallyProcessedCost')
    .select('ClaimId')
    .groupBy('ClaimId')
    .where('Status', 'MANUALLY-PROCESSED')
    .whereIn('ClaimId', claimIds)
}

function subtractManuallyProcessedExpenseCosts (manuallyProcessedExpenseCostsPerClaim) {
  var promises = []

  claimResults.forEach(function (claim) {
    var totalAmount = (claim.TotalApprovedCost - (claim.TotalDeductionAmount || 0))
    claim.PaymentAmount = totalAmount
    manuallyProcessedExpenseCostsPerClaim.forEach(function (manuallyProcessedExpenseCost) {
      if (claim.ClaimId === manuallyProcessedExpenseCost.ClaimId) {
        claim.PaymentAmount = (totalAmount - manuallyProcessedExpenseCost.ManuallyProcessedCost)
        promises.push(updateClaimManuallyProcessedAmount(claim.ClaimId, manuallyProcessedExpenseCost.ManuallyProcessedCost))
      }
    })
    promises.push(updateClaimTotalAmount(claim.ClaimId, totalAmount))
  })
  return Promise.all(promises)
    .then(function () {
      var claimsWithPositivePaymentAmount = claimResults.filter(function (claim) {
        return claim.PaymentAmount > 0
      })
      return claimsWithPositivePaymentAmount
    })
}

module.exports = function () {
  var rawDeductionTotalQuery = '(SELECT SUM(Amount) FROM IntSchema.ClaimDeduction ' +
    'WHERE IntSchema.ClaimDeduction.ClaimId = IntSchema.Claim.ClaimId ' +
    'AND IntSchema.ClaimDeduction.IsEnabled = 1) ' +
    'AS TotalDeductionAmount'

  return knex('IntSchema.Claim')
    .column(knex.raw(rawDeductionTotalQuery))
    .sum('IntSchema.ClaimExpense.ApprovedCost as TotalApprovedCost')
    .select(selectColumns)
    .innerJoin('IntSchema.ClaimBankDetail', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimBankDetail.ClaimId')
    .innerJoin('IntSchema.Visitor', 'IntSchema.Claim.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
    .innerJoin('IntSchema.ClaimExpense', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimExpense.ClaimId')
    .whereIn('IntSchema.Claim.Status', [claimStatuses.APPROVED, claimStatuses.AUTOAPPROVED])
    .whereIn('IntSchema.ClaimExpense.Status', [claimExpenseStatuses.APPROVED, claimExpenseStatuses.APPROVED_DIFF_AMOUNT, claimExpenseStatuses.MANUALLY_PROCESSED])
    .where('IntSchema.Claim.PaymentMethod', paymentMethods.DIRECT_BANK_PAYMENT.value)
    .whereNull('IntSchema.Claim.PaymentStatus')
    .groupBy(selectColumns)
    .then(function (claims) {
      return getManuallyProcessedExpenseCostsPerClaim(claims)
    })
    .then(function (manuallyProcessedExpenseCostsPerClaim) {
      return subtractManuallyProcessedExpenseCosts(manuallyProcessedExpenseCostsPerClaim)
    })
    .then(function (results) {
      return _.map(results, record => {
        return [
          record.ClaimId,
          record.SortCode,
          record.AccountNumber,
          record.FirstName + ' ' + record.LastName,
          record.PaymentAmount.toFixed(2),
          record.Reference + ' ' + moment(record.DateOfJourney).format('YYYY-MM-DD')
        ]
      })
    })
}
