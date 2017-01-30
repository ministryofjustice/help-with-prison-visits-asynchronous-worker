const knexConfig = require('../../../knexfile').asyncworker
const knex = require('knex')(knexConfig)

module.exports = function (schema, eligibilityId) {
  return knex(`${schema}.Claim`)
    .count('EligibilityId as count')
    .where('EligibilityId', eligibilityId)
    .then(function (countResult) {
      return countResult[0].count
    })
}
