const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'claimant-has-not-been-overpaid'
const FAILURE_MESSAGE = 'This claimant has not provided all receipts and documentation for a previous advance claim'

module.exports = function (autoApprovalData) {
  var checkPassed = true

  autoApprovalData.previousClaims.forEach(function (previousClaim) {
    if (previousClaim.IsAdvanceClaim === true && previousClaim.IsOverpaid === true) {
      checkPassed = false
    }
  })

  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? '' : FAILURE_MESSAGE)
}
