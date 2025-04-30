const { getDatabaseConnector } = require('../../databaseConnector')
const claimStatusEnum = require('../../constants/claim-status-enum')

module.exports = (startDateOfJourney, endDateOfJourney) => {
  const db = getDatabaseConnector()

  return db('IntSchema.Claim')
    .join('IntSchema.Visitor', 'IntSchema.Claim.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
    .whereBetween('Claim.DateOfJourney', [startDateOfJourney, endDateOfJourney])
    .andWhere({ 'Claim.IsAdvanceClaim': true, 'Claim.Status': claimStatusEnum.APPROVED })
    .select('IntSchema.Claim.*', 'IntSchema.Visitor.EmailAddress')
}
