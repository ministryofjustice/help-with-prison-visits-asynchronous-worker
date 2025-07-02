const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = (schema, claimId) => {
  const db = getDatabaseConnector()

  return db(`${schema}.Visitor`)
    .join(`${schema}.Claim`, 'Visitor.EligibilityId', 'Claim.EligibilityId')
    .where({ ClaimId: claimId })
    .first('FirstName')
    .then(result => {
      return result.FirstName
    })
}
