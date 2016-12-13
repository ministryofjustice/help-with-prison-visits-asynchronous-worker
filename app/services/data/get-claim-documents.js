const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (schema, reference, eligibilityId, claimId) {
  return knex(`${schema}.ClaimDocument`)
    .where({'Reference': reference, 'EligibilityId': eligibilityId, 'ClaimId': claimId, IsEnabled: true})
}
