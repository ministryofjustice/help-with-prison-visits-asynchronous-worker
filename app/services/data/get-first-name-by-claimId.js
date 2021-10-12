const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = function (schema, claimId) {
  const db = getDatabaseConnector()

  return db(`${schema}.Visitor`)
    .join(`${schema}.Claim`, 'Visitor.EligibilityId', 'Claim.EligibilityId')
    .where({ ClaimId: claimId })
    .first('FirstName')
    .then(function (result) {
      return result.FirstName
    })
}
