const knexConfig = require('../../../knexfile').asyncworker
const knex = require('knex')(knexConfig)
const claimStatusEnum = require('../../constants/claim-status-enum')

module.exports = function (startDateOfJourney, endDateOfJourney) {
  return knex('IntSchema.Claim')
    .join('IntSchema.Visitor', 'IntSchema.Claim.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
    .whereBetween('Claim.DateOfJourney', [startDateOfJourney, endDateOfJourney])
    .andWhere({'Claim.IsAdvanceClaim': true, 'Claim.Status': claimStatusEnum.APPROVED})
    .select('IntSchema.Claim.*', 'IntSchema.Visitor.EmailAddress')
}
