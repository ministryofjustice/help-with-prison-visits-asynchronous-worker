const dateFormatter = require('../../date-formatter')
const claimStatusEnum = require('../../../constants/claim-status-enum')
const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'has-claimed-less-than-max-times-this-month'
const FAILURE_MESSAGE = 'This claimant has claimed more than the maximum number of times this month'

module.exports = function (autoApprovalData) {
  if (!autoApprovalData.previousClaims || autoApprovalData.previousClaims.length < 1) {
    return new AutoApprovalCheckResult(CHECK_NAME, true, '')
  }

  const firstDayOfCurrentMonth = dateFormatter.now().startOf('month').toDate()
  const firstDayOfNextMonth = dateFormatter.now().startOf('month').add('1', 'months').toDate()

  const numberOfClaimsThisMonth = getCountOfApprovedClaimsSubmittedSinceDate(autoApprovalData.previousClaims, autoApprovalData.Claim, firstDayOfCurrentMonth, firstDayOfNextMonth)
  const checkPassed = numberOfClaimsThisMonth <= autoApprovalData.maxNumberOfClaimsPerMonth

  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? '' : FAILURE_MESSAGE)
}

function getCountOfApprovedClaimsSubmittedSinceDate (previousClaims, currentClaim, date, cutOffDate) {
  let count = 0

  if (currentClaim.DateOfJourney >= date && currentClaim.DateOfJourney <= cutOffDate) {
    count++
  }

  const claims = previousClaims.filter(function (claim) {
    return claim.Status === claimStatusEnum.APPROVED ||
      claim.Status === claimStatusEnum.AUTOAPPROVED ||
      claim.Status === claimStatusEnum.APPROVED_ADVANCE_CLOSED
  })

  for (let i = 0; i < claims.length; i++) {
    const claim = claims[i]

    if (claim.DateSubmitted >= date) {
      count++
    }
  }

  return count
}
