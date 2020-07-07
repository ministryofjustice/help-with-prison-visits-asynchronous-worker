const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (claimId, paymentAmount, paymentDate) {
  return knex('IntSchema.Claim')
    .where('ClaimId', claimId)
    .update({
      PaymentStatus: 'PROCESSED',
      PaymentAmount: Number(paymentAmount).toFixed(2),
      PaymentDate: paymentDate
    })
}
