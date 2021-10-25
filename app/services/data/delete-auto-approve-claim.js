const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (autoApprovalId) {
  const db = getDatabaseConnector()

  return db('IntSchema.AutoApproval').where('AutoApprovalId', autoApprovalId).del()
}
