const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (claimId, paymentDate) {
  return knex('IntSchema.TopUp')
    .where('ClaimId', claimId)
    .andWhere('PaymentStatus', 'PENDING')
    .update({
      PaymentStatus: 'PROCESSED',
      PaymentDate: paymentDate
    })
}
