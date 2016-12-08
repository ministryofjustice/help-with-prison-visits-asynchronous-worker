const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (claimId) {
  return knex('IntSchema.ClaimDeduction')
    .where({
      'ClaimId': claimId,
      'IsEnabled': true
    })
}
