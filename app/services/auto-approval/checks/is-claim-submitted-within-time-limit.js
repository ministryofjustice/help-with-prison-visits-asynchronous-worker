const moment = require('moment')

const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'is-claim-submitted-within-time-limit'
const FAILURE_MESSAGE = 'Claim was not submitted with the time limit'

module.exports = function (autoApprovalData) {
  var claimSubmissionDateMoment = moment(autoApprovalData.Claim.DateSubmitted)
  var claimSubmissionCutOffDate = moment(autoApprovalData.latestManuallyApprovedClaim.DateOfJourney).add(autoApprovalData.maxDaysAfterAPVUVisit, 'days')

  var checkPassed = claimSubmissionDateMoment.isSameOrBefore(claimSubmissionCutOffDate)

  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? '' : FAILURE_MESSAGE)
}
