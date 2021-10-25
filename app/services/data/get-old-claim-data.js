const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (dateThreshold) {
  const db = getDatabaseConnector()

  return db('ExtSchema.Claim')
    .select('Claim.EligibilityId', 'Claim.ClaimId', 'Claim.Reference')
    .where('Claim.DateCreated', '<', dateThreshold)
}
