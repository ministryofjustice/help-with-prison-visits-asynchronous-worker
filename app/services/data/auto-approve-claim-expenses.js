const { getDatabaseConnector } = require('../../databaseConnector')

const statusEnum = require('../../constants/status-enum')

module.exports = claimId => {
  const updates = []
  return getClaimExpenses(claimId).then(claimExpenses => {
    claimExpenses.forEach(claimExpense => {
      updates.push(updateClaimExpenseToApproved(claimExpense))
    })

    return Promise.all(updates)
  })
}

function getClaimExpenses(claimId) {
  const db = getDatabaseConnector()

  return db('IntSchema.ClaimExpense').where('ClaimId', claimId).select('ClaimExpenseId', 'Cost')
}

function updateClaimExpenseToApproved(claimExpense) {
  const db = getDatabaseConnector()
  const updatedClaimExpense = {
    Status: statusEnum.APPROVED,
    ApprovedCost: parseFloat(claimExpense.Cost).toFixed(2),
  }

  return db('IntSchema.ClaimExpense').where('ClaimExpenseId', claimExpense.ClaimExpenseId).update(updatedClaimExpense)
}
