const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (dateThreshold) {
  const db = getDatabaseConnector()

  return db('ExtSchema.Eligibility')
    .leftJoin('ExtSchema.Claim', 'Eligibility.EligibilityId', 'Claim.EligibilityId')
    .select('Eligibility.EligibilityId', 'Claim.ClaimId', 'Claim.Reference')
    .where('Eligibility.DateCreated', '<', dateThreshold)
}
