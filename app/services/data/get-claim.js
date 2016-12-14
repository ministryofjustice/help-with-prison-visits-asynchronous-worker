const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (schema, claimId) {
  return knex(`${schema}.Claim`).first().where({'ClaimId': claimId})
}
