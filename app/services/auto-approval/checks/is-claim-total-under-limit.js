const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'is-claim-total-under-limit'
const FAILURE_MESSAGE = 'The total claim value is over the maximum permitted amount'

module.exports = autoApprovalData => {
  let checkPassed
  let claimTotal = 0

  if (autoApprovalData.ClaimExpenses) {
    for (let i = 0; i < autoApprovalData.ClaimExpenses.length; i += 1) {
      const claimExpense = autoApprovalData.ClaimExpenses[i]

      claimTotal += parseFloat(claimExpense.Cost)
    }

    checkPassed = claimTotal <= autoApprovalData.maxClaimTotal
  }
  const ADDITIONAL_INFO = `. Claim ref: ${autoApprovalData.Claim.Reference}, Total claim: ${claimTotal}, Maximum permitted amount: ${autoApprovalData.maxClaimTotal}`
  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? '' : FAILURE_MESSAGE + ADDITIONAL_INFO)
}
