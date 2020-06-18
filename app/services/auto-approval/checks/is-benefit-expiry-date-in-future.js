const moment = require('moment')

const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'is-benefit-expiry-date-in-future'
const FAILURE_MESSAGE = 'The visit date is after the benefit expiry date'

module.exports = function (autoApprovalData) {
  var benefitExpiryDate = null
  if (autoApprovalData.Visitor.BenefitExpiryDate) {
    benefitExpiryDate = moment(autoApprovalData.Visitor.BenefitExpiryDate)
  }
  var dateOfJourney = moment(autoApprovalData.Claim.DateOfJourney)

  var checkPassed = false
  if (benefitExpiryDate) {
    checkPassed = benefitExpiryDate.isAfter(dateOfJourney)
  } else {
    return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? '' : 'The Benefit Expiry Date has not been set')
  }

  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? '' : FAILURE_MESSAGE)
}
