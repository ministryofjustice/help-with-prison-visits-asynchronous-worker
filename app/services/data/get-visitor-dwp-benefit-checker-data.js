const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const moment = require('moment')

module.exports = function (reference, eligibilityId, claimId) {
  return knex('IntSchema.Eligibility')
    .join('IntSchema.Claim', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Claim.EligibilityId')
    .join('IntSchema.Visitor', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
    .join('IntSchema.Benefit', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Benefit.EligibilityId')
    .where({'IntSchema.Eligibility.Reference': reference, 'IntSchema.Eligibility.EligibilityId': eligibilityId, 'IntSchema.Claim.ClaimId': claimId})
    .first({'IntSchema.Visitor.VisitorId': visitorId, 'IntSchema.Visitor.BenefitOwner': benefitOwner, 'IntSchema.Visitor.LastName': visitorLastName, 'IntSchema.Visitor.NationalInsuranceNumber': visitorNationalInsuranceNumber, 'IntSchema.Visitor.DateOfBirth': visitorDateOfBirth, 'IntSchema.Visitor.Benefit': benefit, 'IntSchema.Visitor.EmailAddress': emailAddress, 'IntSchema.Benefit.LastName': benefitLastName, 'IntSchema.Benefit.NationalInsuranceNumber': benefitNationalInsuranceNumber, 'IntSchema.Benefit.DateOfBirth': benefitDateOfBirth})
    .then(function (result) {
        if (result.benefitOwner === no) {
            return {
                'visitorId': result.visitorId,
                'nino': result.benefitNationalInsuranceNumber.trim().toUpperCase(),
                'surname': result.benefitLastName.trim().toUpperCase(),
                'dateOfBirth': moment(result.benefitDateOfBirth).format('YYYYMMDD'),
                'benefit': result.benefit,
                'email': result.emailAddress
            }
        } else {
            return {
                'visitorId': result.visitorId,
                'nino': result.visitorNationalInsuranceNumber.trim().toUpperCase(),
                'surname': result.visitorLastName.trim().toUpperCase(),
                'dateOfBirth': moment(result.visitorDateOfBirth).format('YYYYMMDD'),
                'benefit': result.benefit,
                'email': result.emailAddress
            }    
        }
    })
}
