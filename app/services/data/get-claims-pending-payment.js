const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const _ = require('lodash')
const moment = require('moment')
const claimStatuses = require('../../constants/claim-status-enum')

const selectColumns = ['IntSchema.Claim.ClaimId', 'IntSchema.ClaimBankDetail.SortCode', 'IntSchema.ClaimBankDetail.AccountNumber',
  'IntSchema.Visitor.FirstName', 'IntSchema.Visitor.LastName', 'IntSchema.Claim.Reference', 'IntSchema.Claim.DateOfJourney']

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
    .where({'IntSchema.ClaimExpense.Status': claimStatuses.APPROVED})
    .andWhere(function () {
      this.where('IntSchema.ClaimDeduction.IsEnabled', true)
      .orWhereNull('IntSchema.ClaimDeduction.ClaimDeductionId')
    })
    .whereNull('IntSchema.Claim.PaymentStatus')
    .groupBy(selectColumns)
    .then(function (results) {
      return _.map(results, record => {
        return [
          record.ClaimId,
          record.SortCode,
          record.AccountNumber,
          record.FirstName + ' ' + record.LastName,
          (record.TotalApprovedCost - (record.TotalDeductionAmount || 0)).toString(),
          record.Reference + ' ' + moment(record.DateOfJourney).format('YYYY-MM-DD')
        ]
      })
    })
}
