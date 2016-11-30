const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (oldPaymentIds) {
  return knex('IntSchema.DirectPaymentFile')
    .whereIn('PaymentFileId', oldPaymentIds)
    .update('IsEnabled', 'false')
}
