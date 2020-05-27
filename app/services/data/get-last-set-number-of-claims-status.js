const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (reference, claimId, numberOfClaims) {
  return knex('IntSchema.Claim')
    .select('Status')
    .where({ Reference: reference })
    .whereNot({ ClaimId: claimId })
    .orderBy('DateSubmitted', 'desc')
    .limit(numberOfClaims)
}
