const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

const statusEnum = require('../../constants/status-enum')

module.exports = function (claimExpenses) {
  var updates = []
  claimExpenses.forEach(function (claimExpense) {
    var updatedClaimExpense = {
      Status: statusEnum.AUTOAPPROVED,
      ApprovedCost: claimExpense.Cost
    }

    var update = knex('IntSchema.ClaimExpense')
      .where('ClaimExpenseId', claimExpense.ClaimExpenseId)
      .update(updatedClaimExpense)
    updates.push(update)
  })

  return Promise.all(updates)
}
