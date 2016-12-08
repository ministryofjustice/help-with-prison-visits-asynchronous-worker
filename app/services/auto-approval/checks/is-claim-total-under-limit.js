const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'is-claim-total-under-limit'
const FAILURE_MESSAGE = 'The total claim value is over the maximum permitted amount'

module.exports = function (autoApprovalData) {
  if (autoApprovalData.ClaimExpenses) {
    var claimTotal = 0

    for (var i = 0; i < autoApprovalData.ClaimExpenses.length; i++) {
      var claimExpense = autoApprovalData.ClaimExpenses[i]

      claimTotal += parseFloat(claimExpense.Cost)
    }

    var checkPassed = claimTotal <= autoApprovalData.maxClaimTotal
  }

  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? '' : FAILURE_MESSAGE)
}
