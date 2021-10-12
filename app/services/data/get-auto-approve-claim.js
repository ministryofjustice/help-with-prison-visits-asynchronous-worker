const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function () {
  const db = getDatabaseConnector()

  return db('IntSchema.AutoApproval').select('AutoApprovalId', 'EligibilityId', 'Reference', 'ClaimId', 'EmailAddress')
}
