const statusEnum = require('../../../constants/status-enum')
const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'isNoPreviousPendingClaim'
const FAILURE_MESSAGE = 'There was a previous pending claim for this claimant'

module.exports = function (autoApprovalData) {
  if (autoApprovalData.previousClaims) {
    for (let i = 0; i < autoApprovalData.previousClaims.length; i += 1) {
      const claim = autoApprovalData.previousClaims[i]

      if (claim.Status === statusEnum.PENDING) {
        return new AutoApprovalCheckResult(CHECK_NAME, false, FAILURE_MESSAGE)
      }
    }
  }

  return new AutoApprovalCheckResult(CHECK_NAME, true, '')
}
