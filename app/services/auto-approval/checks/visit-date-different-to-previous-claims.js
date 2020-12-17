const moment = require('moment')

const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'visit-date-different-to-previous-claims'
const FAILURE_MESSAGE = 'The date of visit for this claim is the same as the date of visit for a previous claim'

module.exports = function (autoApprovalData) {
  if (autoApprovalData.previousClaims && autoApprovalData.previousClaims.length > 0) {
    const visitDateMoment = moment(autoApprovalData.Claim.DateOfJourney)

    for (let i = 0; i < autoApprovalData.previousClaims.length; i++) {
      const previousClaim = autoApprovalData.previousClaims[i]
      const dateOfJourney = moment(previousClaim.DateOfJourney)

      if (visitDateMoment.isSame(dateOfJourney)) {
        return new AutoApprovalCheckResult(CHECK_NAME, false, FAILURE_MESSAGE)
      }
    }
  }

  return new AutoApprovalCheckResult(CHECK_NAME, true, '')
}
