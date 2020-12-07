const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'is-claim-total-under-limit'
const FAILURE_MESSAGE = 'The total claim value is over the maximum permitted amount'

module.exports = function (autoApprovalData) {
  let checkPassed
  if (autoApprovalData.ClaimExpenses) {
    let claimTotal = 0

    for (let i = 0; i < autoApprovalData.ClaimExpenses.length; i++) {
      const claimExpense = autoApprovalData.ClaimExpenses[i]

      claimTotal += parseFloat(claimExpense.Cost)
    }

    checkPassed = claimTotal <= autoApprovalData.maxClaimTotal
  }

  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? '' : FAILURE_MESSAGE)
}
