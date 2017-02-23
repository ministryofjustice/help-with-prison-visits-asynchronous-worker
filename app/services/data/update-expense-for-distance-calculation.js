const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (claimExpenseId, fromPostCode, toPostCode, distance, cost) {
  return knex('IntSchema.ClaimExpense')
    .where('ClaimExpenseId', claimExpenseId)
    .update({
      'FromPostCode': fromPostCode,
      'ToPostCode': toPostCode,
      'Distance': Number(distance).toFixed(2),
      'Cost': Number(cost).toFixed(2)
    })
}
