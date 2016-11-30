const config = require('../../../../config')
const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'is-claim-total-under-limit'
const FAILURE_MESSAGE = 'The total claim value is over the maximum permitted amount'
const AUTO_APPROVAL_MAX_CLAIM_TOTAL = parseFloat(config.AUTO_APPROVAL_MAX_CLAIM_TOTAL)

module.exports = function (autoApprovalData) {
  if (autoApprovalData.ClaimExpense) {
    var claimTotal = 0

    for (var i = 0; i < autoApprovalData.ClaimExpenses.length; i++) {
      var claimExpense = autoApprovalData.ClaimExpenses[i]

      claimTotal += parseFloat(claimExpense.Cost)
    }

    var checkPassed = claimTotal <= AUTO_APPROVAL_MAX_CLAIM_TOTAL
  }

  return new AutoApprovalCheckResult(CHECK_NAME, checkPassed, checkPassed ? '' : FAILURE_MESSAGE)
}
