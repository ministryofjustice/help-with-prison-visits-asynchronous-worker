const claimStatusEnum = require('../../../constants/claim-status-enum')
const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'has-claimed-less-than-max-times-this-month'
const FAILURE_MESSAGE = 'This claimant has claimed more than the maximum number of times this month'

module.exports = function (autoApprovalData) {
  if (!autoApprovalData.previousClaims || autoApprovalData.previousClaims.length < 1) {
    return new AutoApprovalCheckResult(CHECK_NAME, true, '')
  }

  var date = new Date()
  var firstDayOfCurrentMonth = new Date(date.getFullYear(), date.getMonth(), 1)

  var numberOfClaimsThisMonth = getCountOfApprovedClaimsSubmittedSinceDate(autoApprovalData.previousClaims, firstDayOfCurrentMonth)
  var checkPassed = numberOfClaimsThisMonth < autoApprovalData.maxNumberOfClaimsPerMonth

  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? '' : FAILURE_MESSAGE)
}

function getCountOfApprovedClaimsSubmittedSinceDate (previousClaims, date) {
  var count = 0

  var claims = previousClaims.filter(function (claim) {
    return claim.Status === claimStatusEnum.APPROVED ||
      claim.Status === claimStatusEnum.AUTOAPPROVED ||
      claim.Status === claimStatusEnum.APPROVED_ADVANCE_CLOSED
  })

  for (var i = 0; i < claims.length; i++) {
    var claim = claims[i]

    if (claim.DateSubmitted > date) {
      count++
    }
  }

  return count
}
