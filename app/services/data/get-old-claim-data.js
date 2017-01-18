const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (dateThreshold) {
  return knex('ExtSchema.Claim')
    .select('Claim.EligibilityId', 'Claim.ClaimId')
    .where('Claim.DateCreated', '<', dateThreshold)
}
