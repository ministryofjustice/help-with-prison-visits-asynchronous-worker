const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'is-claim-total-under-limit'
const FAILURE_MESSAGE = 'The total claim value is over the maximum permitted amount'
const MAX_CLAIM_TOTAL = 250

module.exports = function (autoApprovalData) {
  var claimTotal = 0

  for (var i = 0; i < autoApprovalData.ClaimExpenses.length; i++) {
    var claimExpense = autoApprovalData.ClaimExpenses[i]

    claimTotal += claimExpense.Cost
  }

  var checkPassed = claimTotal <= MAX_CLAIM_TOTAL

  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? FAILURE_MESSAGE : '')
}
