const config = require('../../../knexfile').asyncworker
const statusEnum = require('../../constants/status-enum')
const knex = require('knex')(config)

module.exports = function (olderThanDate) {
  return knex('IntSchema.Claim')
    .where('LastUpdated', '<', olderThanDate)
    .andWhere('Status', statusEnum.PENDING)
    .select('Reference', 'EligibilityId', 'ClaimId')
}
