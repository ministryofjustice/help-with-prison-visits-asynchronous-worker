const moment = require('moment')

const config = require('../../../../config')
const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'is-claim-submitted-within-time-limit'
const FAILURE_MESSAGE = 'A prison visit confirmation and/or receipts have not been uploaded'
const AUTO_APPROVAL_MAX_DAYS_AFTER_APVU_VISIT = parseInt(config.AUTO_APPROVAL_MAX_DAYS_AFTER_APVU_VISIT)

module.exports = function (autoApprovalData) {
  var claimSubmissionDateMoment = moment(autoApprovalData.Claim.DateSubmitted)
  var claimSubmissionCutOffDate = moment(autoApprovalData.Claim.DateOfJourney).add(AUTO_APPROVAL_MAX_DAYS_AFTER_APVU_VISIT, 'days')

  var checkPassed = claimSubmissionDateMoment.isSameOrBefore(claimSubmissionCutOffDate)
  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? FAILURE_MESSAGE : '')
}
