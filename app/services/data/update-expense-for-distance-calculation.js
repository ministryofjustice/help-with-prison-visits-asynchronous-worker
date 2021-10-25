const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (claimExpenseId, fromPostCode, toPostCode, distance, cost) {
  const db = getDatabaseConnector()

  return db('IntSchema.ClaimExpense')
    .where('ClaimExpenseId', claimExpenseId)
    .update({
      FromPostCode: fromPostCode,
      ToPostCode: toPostCode,
      Distance: Number(distance).toFixed(2),
      Cost: Number(cost).toFixed(2)
    })
}
