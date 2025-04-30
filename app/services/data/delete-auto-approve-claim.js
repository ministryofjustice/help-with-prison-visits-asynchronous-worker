const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = autoApprovalId => {
  const db = getDatabaseConnector()

  return db('IntSchema.AutoApproval').where('AutoApprovalId', autoApprovalId).del()
}
