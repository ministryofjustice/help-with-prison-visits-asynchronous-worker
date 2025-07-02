const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = () => {
  const db = getDatabaseConnector()

  return db('IntSchema.AutoApproval').select('AutoApprovalId', 'EligibilityId', 'Reference', 'ClaimId', 'EmailAddress')
}
