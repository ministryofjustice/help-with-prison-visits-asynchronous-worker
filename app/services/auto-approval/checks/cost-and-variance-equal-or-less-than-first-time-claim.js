const groupExpensesByType = require('../../notify/helpers/group-expenses-by-type')
const AutoApprovalCheckResult = require('../../domain/auto-approval-check-result')

const CHECK_NAME = 'cost-and-variance-equal-or-less-than-first-time-claim'
const FAILURE_MESSAGE = 'Claim expense costs are outside of the accepted variance from the last manually approved claim'

module.exports = autoApprovalData => {
  if (autoApprovalData.latestManuallyApprovedClaim && autoApprovalData.latestManuallyApprovedClaim.claimExpenses) {
    const groupedFirstTimeClaimExpenses = groupExpensesByType(
      autoApprovalData.latestManuallyApprovedClaim.claimExpenses,
    )
    const groupedCurrentExpenses = groupExpensesByType(autoApprovalData.ClaimExpenses)

    // Loop through current expense types, get total, and compare against first time expenses of the same types
    for (let i = 0; i < Object.keys(groupedCurrentExpenses).length; i += 1) {
      const index = Object.keys(groupedCurrentExpenses)[i]
      const currentExpenseType = groupedCurrentExpenses[index]
      const firstTimeExpenses = groupedFirstTimeClaimExpenses[index]

      const currentExpenseTypeTotal = getTotal(currentExpenseType, 'Cost')
      const firstTimeExpenseTypeTotal = getTotal(firstTimeExpenses, 'ApprovedCost')

      if (currentExpenseTypeTotal !== firstTimeExpenseTypeTotal) {
        const variance = firstTimeExpenseTypeTotal * (Math.abs(autoApprovalData.costVariancePercentage) / 100)
        const lowerThreshold = firstTimeExpenseTypeTotal - variance
        const upperThreshold = firstTimeExpenseTypeTotal + variance
        const ADDITIONAL_INFO = `. Claim ref: ${autoApprovalData.Claim.Reference}, Current expense type total: ${currentExpenseTypeTotal}, Upper threshold: ${upperThreshold}, Lower threshold: ${lowerThreshold}`

        if (currentExpenseTypeTotal < lowerThreshold || currentExpenseTypeTotal > upperThreshold) {
          return new AutoApprovalCheckResult(CHECK_NAME, false, FAILURE_MESSAGE + ADDITIONAL_INFO)
        }
      }
    }
  }

  return new AutoApprovalCheckResult(CHECK_NAME, true, '')
}

function getTotal(claimExpenses, fieldName) {
  let expenseTypeTotal = 0
  if (!claimExpenses) {
    return expenseTypeTotal
  }

  for (let i = 0; i < claimExpenses.length; i += 1) {
    expenseTypeTotal += claimExpenses[i][fieldName]
  }

  return expenseTypeTotal
}
