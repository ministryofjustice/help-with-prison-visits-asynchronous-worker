const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'is-claimant-trusted'
const FAILURE_MESSAGE = 'This claimant has been marked as untrusted by a case worker'

module.exports = function (autoApprovalData) {
  const checkResult = autoApprovalData.Eligibility.IsTrusted === true

  return new AutoApprovalCheckResult(CHECK_NAME, checkResult, checkResult ? '' : FAILURE_MESSAGE)
}
