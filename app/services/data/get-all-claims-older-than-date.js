const knexConfig = require('../../../knexfile').asyncworker
const knex = require('knex')(knexConfig)

module.exports = function (olderThanDate) {
  return knex('IntSchema.Claim')
    .where('Claim.DateReviewed', '<', olderThanDate)
    .select('ClaimId')
}
