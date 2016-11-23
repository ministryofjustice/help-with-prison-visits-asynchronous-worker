const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

const claimStatuses = require('../../constants/claim-status-enum')

const selectColumns = ['IntSchema.ClaimBankDetail.SortCode', 'IntSchema.ClaimBankDetail.AccountNumber',
      'IntSchema.Visitor.FirstName', 'IntSchema.Visitor.LastName', 'IntSchema.Claim.Reference']

module.exports = function () {
  return knex('IntSchema.Claim')
    .select(selectColumns)
    .sum('IntSchema.ClaimExpense.ApprovedCost as TotalApprovedCost')
    .innerJoin('IntSchema.ClaimBankDetail', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimBankDetail.ClaimId')
    .innerJoin('IntSchema.Visitor', 'IntSchema.Claim.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
    .innerJoin('IntSchema.ClaimExpense', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimExpense.ClaimId')
    .where({'IntSchema.Claim.Status': claimStatuses.APPROVED,
            'IntSchema.Claim.PaymentStatus': claimStatuses.PENDING,
            'IntSchema.ClaimExpense.Status': claimStatuses.APPROVED})
    .groupBy(selectColumns)
    .then(function (result) {
      return {
        'SortCode': result.SortCode,
        'AccountNumber': result.AccountNumber,
        'Name': result.FirstName + ' ' + result.LastName,
        'TotalApprovedCost': result.TotalApprovedCost,
        'Reference': result.Reference
      }
    })
}
