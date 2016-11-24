const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const _ = require('lodash')
const claimStatuses = require('../../constants/claim-status-enum')

const selectColumns = ['IntSchema.ClaimBankDetail.SortCode', 'IntSchema.ClaimBankDetail.AccountNumber',
      'IntSchema.Visitor.FirstName', 'IntSchema.Visitor.LastName', 'IntSchema.Claim.Reference']

module.exports = function () {
  return knex('IntSchema.Claim')
    .sum('IntSchema.ClaimExpense.ApprovedCost as TotalApprovedCost')
    .select(selectColumns)
    .innerJoin('IntSchema.ClaimBankDetail', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimBankDetail.ClaimId')
    .innerJoin('IntSchema.Visitor', 'IntSchema.Claim.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
    .innerJoin('IntSchema.ClaimExpense', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimExpense.ClaimId')
    .where({'IntSchema.Claim.Status': claimStatuses.APPROVED,
            'IntSchema.ClaimExpense.Status': claimStatuses.APPROVED})
    .whereNull('IntSchema.Claim.PaymentStatus')
    .groupBy(selectColumns)
    .then(function (results) {
      return _.map(results, record => {
        return [
          record.SortCode,
          record.AccountNumber,
          record.FirstName + ' ' + record.LastName,
          record.TotalApprovedCost.toString(),
          record.Reference
        ]
      })
    })
}
