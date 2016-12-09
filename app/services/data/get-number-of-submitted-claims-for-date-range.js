const knexConfig = require('../../../knexfile').asyncworker
const knex = require('knex')(knexConfig)

module.exports = function (startDateSubmitted, endDateSubmitted) {
  return knex('IntSchema.Claim')
    .count('ClaimId as count')
    .whereBetween('DateSubmitted', [startDateSubmitted, endDateSubmitted])
    .then(function (countResult) {
      return countResult[0].count
    })
}
