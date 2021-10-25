const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (dateThreshold) {
  const db = getDatabaseConnector()

  return db('ExtSchema.ClaimDocument')
    .select('ClaimDocument.EligibilityId', 'ClaimDocument.ClaimId', 'ClaimDocument.Reference')
    .where('ClaimDocument.DateSubmitted', '<', dateThreshold)
}
