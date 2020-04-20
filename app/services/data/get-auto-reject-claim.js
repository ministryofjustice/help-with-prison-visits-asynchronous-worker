const config = require('../../../knexfile').asyncworker
const statusEnum = require('../../constants/status-enum')
const knex = require('knex')(config)

module.exports = function (olderThanDate) {
	return knex('IntSchema.Claim')
    .where('Claim.LastUpdated', '<', olderThanDate)
    .andWhere('Claim.Status' = statusEnum.PENDING)
    .select('Reference','EligibilityId','ClaimId')
}
