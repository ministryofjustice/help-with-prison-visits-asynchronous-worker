const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const moment = require('moment')
const log = require('../../../app/services/log')

module.exports = function (reference, eligibilityId, claimId) {
  return knex('IntSchema.Eligibility')
    .join('IntSchema.Claim', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Claim.EligibilityId')
    .join('IntSchema.Visitor', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
    .leftJoin('IntSchema.Benefit', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Benefit.EligibilityId')
    .where({'IntSchema.Eligibility.Reference': reference, 'IntSchema.Eligibility.EligibilityId': eligibilityId, 'IntSchema.Claim.ClaimId': claimId})
    .first('IntSchema.Visitor.VisitorId', 'IntSchema.Visitor.BenefitOwner', 'IntSchema.Visitor.LastName', 'IntSchema.Visitor.NationalInsuranceNumber', 'IntSchema.Visitor.DateOfBirth', 'IntSchema.Visitor.Benefit', 'IntSchema.Visitor.EmailAddress', 'IntSchema.Benefit.LastName', 'IntSchema.Benefit.NationalInsuranceNumber', 'IntSchema.Benefit.DateOfBirth')
    .then(function (result) {
      if (result.BenefitOwner === 'no') {
        return {
          'visitorId': result.VisitorId,
          'nino': result.NationalInsuranceNumber[1].trim().toUpperCase(),
          'surname': result.LastName[1].trim().toUpperCase(),
          'dateOfBirth': moment(result.DateOfBirth[1]).format('YYYYMMDD'),
          'benefit': result.Benefit,
          'email': result.EmailAddress
        }
      } else {
        return {
          'visitorId': result.VisitorId,
          'nino': result.NationalInsuranceNumber[0].trim().toUpperCase(),
          'surname': result.LastName[0].trim().toUpperCase(),
          'dateOfBirth': moment(result.DateOfBirth[0]).format('YYYYMMDD'),
          'benefit': result.Benefit,
          'email': result.EmailAddress
        }
      }
    })
}
