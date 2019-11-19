const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const _ = require('lodash')
const paymentMethods = require('../../constants/payment-method-enum')

const directBankColumns = ['IntSchema.Claim.ClaimId', 'IntSchema.ClaimBankDetail.SortCode', 'IntSchema.ClaimBankDetail.AccountNumber',
  'IntSchema.Visitor.FirstName', 'IntSchema.Visitor.LastName', 'IntSchema.Claim.Reference', 'IntSchema.Claim.DateOfJourney', 'IntSchema.Visitor.Country']

var payoutColumns = ['IntSchema.Claim.ClaimId', 'IntSchema.Visitor.FirstName', 'IntSchema.Visitor.LastName', 'IntSchema.Visitor.HouseNumberAndStreet',
  'IntSchema.Visitor.Town', 'IntSchema.Visitor.County', 'IntSchema.Visitor.Country', 'IntSchema.Visitor.PostCode', 'IntSchema.Visitor.Reference']

function directPaymentsReturn (results) {
  return _.map(results, record => {
    return [
      record.ClaimId,
      record.SortCode,
      record.AccountNumber,
      record.FirstName + ' ' + record.LastName,
      record.PaymentAmount.toFixed(2),
      record.Reference,
      record.Country
    ]
  })
}

function payoutPaymentsReturn (results) {
  return _.map(results, record => {
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
      record.Reference
    ]
  })
}

module.exports = function (paymentMethod) {
  var rawDeductionTotalQuery = '(SELECT SUM(Amount) FROM IntSchema.ClaimDeduction ' +
    'WHERE IntSchema.ClaimDeduction.ClaimId = IntSchema.Claim.ClaimId ' +
    'AND IntSchema.ClaimDeduction.IsEnabled = 1) ' +
    'AS TotalDeductionAmount'
  var selectColumns = paymentMethod === paymentMethods.DIRECT_BANK_PAYMENT.value ? directBankColumns : payoutColumns

  return knex('IntSchema.Claim')
    .column(knex.raw(rawDeductionTotalQuery))
    .sum('IntSchema.TopUp.TopUpAmount as PaymentAmount')
    .select(selectColumns)
    .leftJoin('IntSchema.ClaimBankDetail', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimBankDetail.ClaimId')
    .innerJoin('IntSchema.Visitor', 'IntSchema.Claim.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
    .innerJoin('IntSchema.TopUp', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.TopUp.ClaimId')
    .where('IntSchema.TopUp.IsPaid', false)
    .where('IntSchema.Claim.PaymentMethod', paymentMethod)
    .whereNull('IntSchema.TopUp.PaymentDate')
    .groupBy(selectColumns)
    .then(function (claims) {
      var claimIds = []
      claims.forEach(function (result) { return claimIds.push(result.ClaimId) })
      if (paymentMethod === paymentMethods.DIRECT_BANK_PAYMENT.value) {
        return directPaymentsReturn(claims)
      } else {
        return payoutPaymentsReturn(claims)
      }
    })
}
