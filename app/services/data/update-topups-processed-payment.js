const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (topUpId, paymentDate) {
  return knex('IntSchema.TopUp')
    .where('TopUpId', topUpId)
    .update({
      'IsPaid': true,
      'PaymentDate': paymentDate
    })
}
