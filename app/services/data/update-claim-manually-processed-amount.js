const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = (claimId, manuallyProcessedAmount) => {
  const db = getDatabaseConnector()

  return db('IntSchema.Claim')
    .where('ClaimId', claimId)
    .update('ManuallyProcessedAmount', Number(manuallyProcessedAmount).toFixed(2))
}
