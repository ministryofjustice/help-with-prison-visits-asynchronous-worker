const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const _ = require('lodash')
const moment = require('moment')
const claimStatuses = require('../../constants/claim-status-enum')
const paymentMethods = require('../../constants/payment-method-enum')

const selectColumns = ['IntSchema.Claim.ClaimId', 'IntSchema.ClaimBankDetail.SortCode', 'IntSchema.ClaimBankDetail.AccountNumber',
  'IntSchema.Visitor.FirstName', 'IntSchema.Visitor.LastName', 'IntSchema.Claim.Reference', 'IntSchema.Claim.DateOfJourney']

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
    .where({
      'IntSchema.ClaimExpense.Status': claimStatuses.APPROVED,
      'IntSchema.Claim.PaymentMethod': paymentMethods.DIRECT_BANK_PAYMENT.value
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
