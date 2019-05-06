const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const moment = require('moment')
const log = require('../log')

module.exports = function (reference, eligibilityId, claimId) {
  return knex('IntSchema.Eligibility')
    .join('IntSchema.Claim', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Claim.EligibilityId')
    .join('IntSchema.Visitor', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Visitor.EligibilityId')
    .leftJoin('IntSchema.Benefit', 'IntSchema.Eligibility.EligibilityId', '=', 'IntSchema.Benefit.EligibilityId')
    .where({'IntSchema.Eligibility.Reference': reference, 'IntSchema.Eligibility.EligibilityId': eligibilityId, 'IntSchema.Claim.ClaimId': claimId})
    .first('IntSchema.Visitor.VisitorId', 'IntSchema.Visitor.BenefitOwner', 'IntSchema.Visitor.LastName', 'IntSchema.Visitor.NationalInsuranceNumber', 'IntSchema.Visitor.DateOfBirth', 'IntSchema.Visitor.Benefit', 'IntSchema.Visitor.EmailAddress', 'IntSchema.Benefit.LastName', 'IntSchema.Benefit.NationalInsuranceNumber', 'IntSchema.Benefit.DateOfBirth')
    .then(function (result) {

        log.info(result)

        log.info('BenefitOwner ' + result.BenefitOwner)

        if (result.BenefitOwner === 'no') {
            log.info('visitorId:' + result.VisitorId)
            log.info('nino: ' + result.NationalInsuranceNumber[1].trim().toUpperCase())
            log.info('surname: ' + result.LastName[1].trim().toUpperCase())
            log.info('dateOfBirth: ' + moment(result.DateOfBirth[1]).format('YYYYMMDD'))
            log.info('benefit: ' + result.Benefit)
            log.info('email: ' + result.EmailAddress)
            return {
                'visitorId': result.VisitorId,
                'nino': result.NationalInsuranceNumber[1].trim().toUpperCase(),
                'surname': result.LastName[1].trim().toUpperCase(),
                'dateOfBirth': moment(result.DateOfBirth[1]).format('YYYYMMDD'),
                'benefit': result.Benefit,
                'email': result.EmailAddress
            }
        } else {
            log.info('visitorId:' + result.VisitorId)
            log.info('nino: ' + result.NationalInsuranceNumber.trim().toUpperCase())
            log.info('surname: ' + result.LastName.trim().toUpperCase())
            log.info('dateOfBirth: ' + moment(result.DateOfBirth).format('YYYYMMDD'))
            log.info('benefit: ' + result.Benefit)
            log.info('email: ' + result.EmailAddress)
            return {
                'visitorId': result.VisitorId,
                'nino': result.NationalInsuranceNumber.trim().toUpperCase(),
                'surname': result.LastName.trim().toUpperCase(),
                'dateOfBirth': moment(result.DateOfBirth).format('YYYYMMDD'),
                'benefit': result.Benefit,
                'email': result.EmailAddress
            }    
        }
    })
}
