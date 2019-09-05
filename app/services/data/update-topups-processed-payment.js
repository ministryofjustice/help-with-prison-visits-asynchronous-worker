const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (claimId, paymentDate) {
  return knex('IntSchema.TopUp')
    .where('ClaimId', claimId)
    .update({
      'IsPaid': true,
      'PaymentDate': paymentDate
    })
}
