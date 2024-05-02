const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (claimId) {
  const db = getDatabaseConnector()

  return db('IntSchema.ClaimDeduction').where({
    ClaimId: claimId,
    IsEnabled: true,
  })
}
