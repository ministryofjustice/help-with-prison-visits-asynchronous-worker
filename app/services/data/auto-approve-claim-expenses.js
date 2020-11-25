const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

const statusEnum = require('../../constants/status-enum')

module.exports = function (claimId) {
  const updates = []
  return getClaimExpenses(claimId)
    .then(function (claimExpenses) {
      claimExpenses.forEach(function (claimExpense) {
        updates.push(updateClaimExpenseToApproved(claimExpense))
      })

      return Promise.all(updates)
    })
}

function getClaimExpenses (claimId) {
  return knex('IntSchema.ClaimExpense')
    .where('ClaimId', claimId)
    .select('ClaimExpenseId', 'Cost')
}

function updateClaimExpenseToApproved (claimExpense) {
  const updatedClaimExpense = {
    Status: statusEnum.APPROVED,
    ApprovedCost: parseFloat(claimExpense.Cost).toFixed(2)
  }

  return knex('IntSchema.ClaimExpense')
    .where('ClaimExpenseId', claimExpense.ClaimExpenseId)
    .update(updatedClaimExpense)
}
