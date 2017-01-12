const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (dateThreshold) {
  return knex('ExtSchema.Eligibility')
    .leftJoin('ExtSchema.Claim', 'Eligibility.EligibilityId', 'Claim.EligibilityId')
    .select('Eligibility.EligibilityId', 'Claim.ClaimId')
    .where('Eligibility.DateCreated', '<', dateThreshold)
}
