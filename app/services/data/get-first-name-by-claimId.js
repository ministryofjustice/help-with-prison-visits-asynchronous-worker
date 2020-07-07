const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (schema, claimId) {
  return knex(`${schema}.Visitor`)
    .join(`${schema}.Claim`, 'Visitor.EligibilityId', 'Claim.EligibilityId')
    .where({ ClaimId: claimId })
    .first('FirstName')
    .then(function (result) {
      return result.FirstName
    })
}
