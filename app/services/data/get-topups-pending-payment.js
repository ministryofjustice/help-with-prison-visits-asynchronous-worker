const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const _ = require('lodash')
const paymentMethods = require('../../constants/payment-method-enum')

const directBankColumns = ['IntSchema.Claim.ClaimId', 'IntSchema.ClaimBankDetail.SortCode', 'IntSchema.ClaimBankDetail.AccountNumber',
  'IntSchema.Visitor.FirstName', 'IntSchema.Visitor.LastName', 'IntSchema.Claim.Reference', 'IntSchema.Claim.DateOfJourney', 'IntSchema.Visitor.Country', 'IntSchema.ClaimBankDetail.NameOnAccount',
  'IntSchema.ClaimBankDetail.RollNumber', 'IntSchema.TopUp.TopUpId']

const payoutColumns = ['IntSchema.Claim.ClaimId', 'IntSchema.Visitor.FirstName', 'IntSchema.Visitor.LastName', 'IntSchema.Visitor.HouseNumberAndStreet',
  'IntSchema.Visitor.Town', 'IntSchema.Visitor.County', 'IntSchema.Visitor.Country', 'IntSchema.Visitor.PostCode', 'IntSchema.Visitor.Reference', 'IntSchema.Claim.DateOfJourney', 'IntSchema.TopUp.TopUpId']

function directPaymentsReturn (results) {
  return _.map(results, record => {
    return [
      record.ClaimId,
      record.SortCode,
      record.AccountNumber,
      record.NameOnAccount,
      record.PaymentAmount.toFixed(2),
      record.Reference,
      record.Country,
      record.RollNumber
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
      record.Reference,
      record.DateOfJourney
    ]
  })
}

module.exports = function (paymentMethod) {
  const selectColumns = paymentMethod === paymentMethods.DIRECT_BANK_PAYMENT.value ? directBankColumns : payoutColumns

  return knex('IntSchema.Claim')
    .sum('IntSchema.TopUp.TopUpAmount as PaymentAmount')
    .select(selectColumns)
    .leftJoin('IntSchema.ClaimBankDetail', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.ClaimBankDetail.ClaimId')
    .innerJoin('IntSchema.Visitor', 'IntSchema.Claim.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
    .innerJoin('IntSchema.TopUp', 'IntSchema.Claim.ClaimId', '=', 'IntSchema.TopUp.ClaimId')
    .where('IntSchema.TopUp.PaymentStatus', 'PENDING')
    .where('IntSchema.Claim.PaymentMethod', paymentMethod)
    .whereNull('IntSchema.TopUp.PaymentDate')
    .groupBy(selectColumns)
    .then(function (topups) {
      if (paymentMethod === paymentMethods.DIRECT_BANK_PAYMENT.value) {
        return directPaymentsReturn(topups)
      } else {
        return payoutPaymentsReturn(topups)
      }
    })
}
