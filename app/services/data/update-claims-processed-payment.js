const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (claimId, paymentAmount) {
  return knex('IntSchema.Claim')
    .where('ClaimId', claimId)
    .update({'PaymentStatus': 'PROCESSED', 'PaymentAmount': paymentAmount})
}
