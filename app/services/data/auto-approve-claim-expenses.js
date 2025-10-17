const { getDatabaseConnector } = require('../../databaseConnector')
const log = require('../log')

const statusEnum = require('../../constants/status-enum')

module.exports = claimId => {
  const updates = []
  log.info(`Auto approval: Get claim expenses ${claimId}`)

  return getClaimExpenses(claimId).then(claimExpenses => {
    claimExpenses.forEach(claimExpense => {
      log.info(`Auto approval: Update claim expense ${claimExpense.ClaimExpenseId} for claim ${claimId}`)
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
