const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'is-release-date-set'
const FAILURE_MESSAGE = 'Auto-Approval is disabled for prisoners with pending release dates'

module.exports = function (autoApprovalData) {
  const releaseDateIsSet = autoApprovalData.Prisoner.ReleaseDateIsSet
  const checkPassed = releaseDateIsSet === true

  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? '' : FAILURE_MESSAGE)
}
