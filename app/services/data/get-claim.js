const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (schema, claimId) {
  const db = getDatabaseConnector()

  return db(`${schema}.Claim`).first().where({ ClaimId: claimId })
}
