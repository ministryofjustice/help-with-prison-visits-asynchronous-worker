const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (dateThreshold) {
  return knex('ExtSchema.ClaimDocument')
    .select('ClaimDocument.EligibilityId', 'ClaimDocument.ClaimId', 'ClaimDocument.Reference')
    .where('ClaimDocument.DateSubmitted', '<', dateThreshold)
}
