const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'is-latest-manual-claim-approved'
const FAILURE_MESSAGE = 'The last manually evaluated claim was not approved'

module.exports = function (autoApprovalData) {
  if (autoApprovalData.latestManualClaim) {
    if (autoApprovalData.latestManualClaim.Status === 'APPROVED') {
      return new AutoApprovalCheckResult(CHECK_NAME, true, '')
    } else {
      return new AutoApprovalCheckResult(CHECK_NAME, false, FAILURE_MESSAGE)
    }
  } else {
    return new AutoApprovalCheckResult(CHECK_NAME, false, FAILURE_MESSAGE)
  }
}
