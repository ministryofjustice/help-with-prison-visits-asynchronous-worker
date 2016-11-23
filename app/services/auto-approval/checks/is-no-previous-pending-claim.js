const statusEnum = require('../../../constants/status-enum')
const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const checkName = 'isNoPreviousPendingClaim'
const failureMessage = 'There was a previous pending claim for this claimant'

module.exports = function (autoApprovalData) {
  for (var i = 0; i < autoApprovalData.previousClaims.length; i++) {
    var claim = autoApprovalData.previousClaims[i]

    if (claim.Status === statusEnum.PENDING) {
      return new AutoApprovalCheckResult(checkName, false, failureMessage)
    }
  }

  return new AutoApprovalCheckResult(checkName, true, '')
}
