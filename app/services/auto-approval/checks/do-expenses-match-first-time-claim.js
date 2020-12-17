const groupExpensesByType = require('../../notify/helpers/group-expenses-by-type')
const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'do-expenses-match-first-time-claim'
const FAILURE_MESSAGE = 'The number or type of expenses for this claim don\'t match the last manually approved claim'

module.exports = function (autoApprovalData) {
  if (autoApprovalData.latestManuallyApprovedClaim && autoApprovalData.latestManuallyApprovedClaim.claimExpenses) {
    const groupedFirstTimeClaimExpenses = groupExpensesByType(autoApprovalData.latestManuallyApprovedClaim.claimExpenses)
    const groupedCurrentExpenses = groupExpensesByType(autoApprovalData.ClaimExpenses)

    for (let i = 0; i < Object.keys(groupedCurrentExpenses).length; i++) {
      const index = Object.keys(groupedCurrentExpenses)[i]
      const currentExpenseTypeGroup = groupedCurrentExpenses[index]

      // For each expense type, check that the first time claim contains the same expense type
      // with the same or less number of claim expenses
      if (!groupedFirstTimeClaimExpenses[index] || currentExpenseTypeGroup.length > groupedFirstTimeClaimExpenses[index].length) {
        return new AutoApprovalCheckResult(CHECK_NAME, false, FAILURE_MESSAGE)
      }
    }
  }

  return new AutoApprovalCheckResult(CHECK_NAME, true, '')
}
