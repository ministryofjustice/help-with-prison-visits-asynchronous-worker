const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const checkName = 'isLatestManualClaimApproved'
const failureMessage = 'The last manually evaluated claim was rejected'

module.exports = function (autoApprovalData) {
  if (autoApprovalData.latestManuallyApprovedClaim && autoApprovalData.latestManuallyApprovedClaim.Status === 'APPROVED') {
    return new AutoApprovalCheckResult(checkName, true, '')
  } else {
    return new AutoApprovalCheckResult(checkName, false, failureMessage)
  }
}
