const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const moment = require('moment')

module.exports = function (reference, eligibilityId, claimId) {
  return knex('IntSchema.Eligibility')
    .join('IntSchema.Claim', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Claim.EligibilityId')
    .join('IntSchema.Visitor', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
    .where({'IntSchema.Eligibility.Reference': reference, 'IntSchema.Eligibility.EligibilityId': eligibilityId, 'IntSchema.Claim.ClaimId': claimId})
    .first('IntSchema.Visitor.VisitorId', 'IntSchema.Visitor.LastName', 'IntSchema.Visitor.NationalInsuranceNumber', 'IntSchema.Visitor.DateOfBirth')
    .then(function (result) {
      return {
        'visitorId': result.VisitorId,
        'nino': result.NationalInsuranceNumber.trim().toUpperCase(),
        'surname': result.LastName.trim().toUpperCase(),
        'dateOfBirth': moment(result.DateOfBirth).format('YYYYMMDD')
      }
    })
}
