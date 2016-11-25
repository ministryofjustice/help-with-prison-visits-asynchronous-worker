const groupExpensesByType = require('../../notify/helpers/group-expenses-by-type')

const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'cost-and-variance-equal-or-less-than-first-time-claim'
const FAILURE_MESSAGE = 'Claim expense costs are outside of the accepted variance from the last manually approved claim'
const COST_VARIANCE_PERCENTAGE = 0.1

module.exports = function (autoApprovalData) {
  var groupedFirstTimeClaimExpenses = groupExpensesByType(autoApprovalData.latestManuallyApprovedClaim.claimExpenses)
  var groupedCurrentExpenses = groupExpensesByType(autoApprovalData.ClaimExpenses)

  // Loop through current expense types, get total, and compare against first time expenses of the same types
  for (var i = 0; i < Object.keys(groupedCurrentExpenses).length; i++) {
    var index = Object.keys(groupedCurrentExpenses)[i]
    var currentExpenseType = groupedCurrentExpenses[index]
    var firstTimeExpenses = groupedFirstTimeClaimExpenses[index]

    var currentExpenseTypeTotal = getTotalCost(currentExpenseType)
    var firstTimeExpenseTypeTotal = getTotalCost(firstTimeExpenses)

    if (currentExpenseTypeTotal !== firstTimeExpenseTypeTotal) {
      var lowerThreshold = firstTimeExpenseTypeTotal * (1 - COST_VARIANCE_PERCENTAGE)
      var upperThreshold = firstTimeExpenseTypeTotal * (1 + COST_VARIANCE_PERCENTAGE)

      if (currentExpenseTypeTotal < lowerThreshold || currentExpenseTypeTotal > upperThreshold) {
        return new AutoApprovalCheckResult(CHECK_NAME, false, FAILURE_MESSAGE)
      }
    }
  }

  return new AutoApprovalCheckResult(CHECK_NAME, true, '')
}

function getTotalCost (claimExpenses) {
  var expenseTypeTotal = 0
  if (!claimExpenses) {
    return expenseTypeTotal
  }

  for (var i = 0; i < claimExpenses.length; i++) {
    expenseTypeTotal += claimExpenses[i].Cost
  }

  return expenseTypeTotal
}
