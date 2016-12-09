const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (claimId, status) {
  return knex('IntSchema.Claim')
    .where({'ClaimId': claimId})
    .update({'Status': status})
}
