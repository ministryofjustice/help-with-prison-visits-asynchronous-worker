const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (claimId, manuallyProcessedAmount) {
  const db = getDatabaseConnector()

  return db('IntSchema.Claim')
    .where('ClaimId', claimId)
    .update('ManuallyProcessedAmount', Number(manuallyProcessedAmount).toFixed(2))
}
