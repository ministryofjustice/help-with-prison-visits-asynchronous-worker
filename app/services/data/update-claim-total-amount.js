const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (claimId, totalAmount) {
  const db = getDatabaseConnector()

  return db('IntSchema.Claim').where('ClaimId', claimId).update('TotalAmount', Number(totalAmount).toFixed(2))
}
