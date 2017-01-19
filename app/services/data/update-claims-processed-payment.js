const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (claimId, bankPaymentAmount, paymentMethod) {
  return knex('IntSchema.Claim')
    .where('ClaimId', claimId)
    .update({
      'PaymentStatus': 'PROCESSED',
      'BankPaymentAmount': bankPaymentAmount,
      'PaymentMethod': paymentMethod
    })
}
