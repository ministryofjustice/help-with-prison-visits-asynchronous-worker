const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = (schema, claimId) => {
  const db = getDatabaseConnector()

  return db(`${schema}.Claim`).first().where({ ClaimId: claimId })
}
