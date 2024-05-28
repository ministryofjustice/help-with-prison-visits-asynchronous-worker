// const moment = require('moment')
const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'is-claim-submitted-within-time-limit'
// const FAILURE_MESSAGE = 'Claim was not submitted with the time limit'

module.exports = function (_autoApprovalData) {
  return new AutoApprovalCheckResult(CHECK_NAME, true, '')
  // const claimSubmissionDateMoment = moment(_autoApprovalData.Claim.DateSubmitted)
  // let claimSubmissionCutOffDate
  // if (_autoApprovalData.latestManuallyApprovedClaim) {
  //   claimSubmissionCutOffDate = moment(_autoApprovalData.latestManuallyApprovedClaim.DateReviewed).add(
  //     _autoApprovalData.maxDaysAfterAPVUVisit,
  //     'days',
  //   )
  // } else {
  //   return new AutoApprovalCheckResult(CHECK_NAME, false, 'There is no manually approved claim for this eligibility')
  // }

  // const checkPassed = claimSubmissionDateMoment.isSameOrBefore(claimSubmissionCutOffDate)

  // const ADDITIONAL_INFO = `. Claim ref: ${_autoApprovalData.Claim.Reference}, Claim submission date: ${claimSubmissionDateMoment.format('DD/MM/YYYY')}, Claim submission cut off date: ${claimSubmissionCutOffDate.format('DD/MM/YYYY')}`
  // return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? '' : FAILURE_MESSAGE + ADDITIONAL_INFO)
}
