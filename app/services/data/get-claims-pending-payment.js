const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const _ = require('lodash')
const moment = require('moment')
const claimStatuses = require('../../constants/claim-status-enum')
const updateClaimTotalAmount = require('./update-claim-total-amount')

const selectColumns = ['IntSchema.Claim.ClaimId', 'IntSchema.ClaimBankDetail.SortCode', 'IntSchema.ClaimBankDetail.AccountNumber',
  'IntSchema.Visitor.FirstName', 'IntSchema.Visitor.LastName', 'IntSchema.Claim.Reference', 'IntSchema.Claim.DateOfJourney']

var claimResults

module.exports = function () {
  return knex('IntSchema.Claim')
    .sumDistinct('IntSchema.ClaimDeduction.Amount AS TotalDeductionAmount')
    .sumDistinct('IntSchema.ClaimExpense.ApprovedCost as TotalApprovedCost')
    .select(selectColumns)
    .innerJoin('IntSchema.ClaimBankDetail', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimBankDetail.ClaimId')
    .innerJoin('IntSchema.Visitor', 'IntSchema.Claim.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
    .innerJoin('IntSchema.ClaimExpense', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimExpense.ClaimId')
    .leftJoin('IntSchema.ClaimDeduction', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimDeduction.ClaimId')
    .whereIn('IntSchema.Claim.Status', [claimStatuses.APPROVED, claimStatuses.AUTOAPPROVED])
    .whereIn('IntSchema.ClaimExpense.Status', [claimStatuses.APPROVED, 'APPROVED-DIFF-AMOUNT', 'MANUALLY-PROCESSED'])
    .andWhere(function () {
      this.where('IntSchema.ClaimDeduction.IsEnabled', true)
      .orWhereNull('IntSchema.ClaimDeduction.ClaimDeductionId')
    })
    .whereNull('IntSchema.Claim.PaymentStatus')
    .groupBy(selectColumns)
    .then(function (results) {
      var claimIds = []
      results.forEach(function (result) { return claimIds.push(result.ClaimId) })
      claimResults = results
      return knex('IntSchema.ClaimExpense')
        .sum('ApprovedCost as ManuallyProcessedCost')
        .select('ClaimId')
        .groupBy('ClaimId')
        .where('Status', 'MANUALLY-PROCESSED')
        .whereIn('ClaimId', claimIds)
    })
    .then(function (manuallyProcessedExpenses) {
      var promises = []
      claimResults.forEach(function (claim) {
        // Store the total claim cost
        promises.push(updateClaimTotalAmount(claim.ClaimId, claim.TotalApprovedCost))
      })

      return Promise.all(promises)
        .then(function () {
          // Remove manually processed amount
          claimResults.forEach(function (claim) {
            claim.PaymentAmount = claim.TotalApprovedCost
            manuallyProcessedExpenses.forEach(function (expense) {
              if (claim.ClaimId === expense.ClaimId) {
                claim.PaymentAmount = (claim.TotalApprovedCost - expense.ManuallyProcessedCost)
              }
            })
          })
          return claimResults
        })
    })
    .then(function (results) {
      return _.map(results, record => {
        return [
          record.ClaimId,
          record.SortCode,
          record.AccountNumber,
          record.FirstName + ' ' + record.LastName,
          (record.PaymentAmount - (record.TotalDeductionAmount || 0)).toString(),
          record.Reference + ' ' + moment(record.DateOfJourney).format('YYYY-MM-DD')
        ]
      })
    })
}
