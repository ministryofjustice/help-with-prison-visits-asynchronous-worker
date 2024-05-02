const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (olderThanDate) {
  const db = getDatabaseConnector()

  return db('IntSchema.Claim').where('Claim.DateReviewed', '<', olderThanDate).select('ClaimId')
}
