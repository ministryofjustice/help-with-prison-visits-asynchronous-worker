const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = olderThanDate => {
  const db = getDatabaseConnector()

  return db('IntSchema.Claim').where('Claim.DateReviewed', '<', olderThanDate).select('ClaimId')
}
