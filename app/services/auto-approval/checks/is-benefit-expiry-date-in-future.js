const moment = require('moment')

const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'is-benefit-expiry-date-in-future'
const FAILURE_MESSAGE = 'The visit date is after the benefit expiry date'

module.exports = autoApprovalData => {
  let benefitExpiryDate = null
  if (autoApprovalData.Visitor.BenefitExpiryDate) {
    benefitExpiryDate = moment(autoApprovalData.Visitor.BenefitExpiryDate)
  }
  const dateOfJourney = moment(autoApprovalData.Claim.DateOfJourney)

  let checkPassed = false
  if (benefitExpiryDate) {
    checkPassed = benefitExpiryDate.isSameOrAfter(dateOfJourney)
  } else {
    return new AutoApprovalCheckResult(
      CHECK_NAME,
      checkPassed,
      checkPassed ? '' : 'The Benefit Expiry Date has not been set',
    )
  }
  const ADDITIONAL_INFO = `. Claim ref: ${autoApprovalData.Claim.Reference}, Benefit expiry date: ${benefitExpiryDate.format('DD/MM/YYYY')}, Date of journey: ${dateOfJourney.format('DD/MM/YYYY')}`
  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? '' : FAILURE_MESSAGE + ADDITIONAL_INFO)
}
