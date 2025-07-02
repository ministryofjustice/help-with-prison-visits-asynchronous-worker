const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = claimId => {
  const db = getDatabaseConnector()

  return db('IntSchema.ClaimDeduction').where({
    ClaimId: claimId,
    IsEnabled: true,
  })
}
