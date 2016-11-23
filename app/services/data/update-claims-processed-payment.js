const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (references) {
  return knex('IntSchema.Claim')
    .whereIn('Reference', references)
    .update('PaymentStatus', 'PROCESSED')
}
