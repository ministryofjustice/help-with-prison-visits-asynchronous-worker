const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = (schema, reference, eligibilityId, claimId) => {
  const db = getDatabaseConnector()

  return db(`${schema}.ClaimDocument`)
    .where({ Reference: reference, EligibilityId: eligibilityId, ClaimId: claimId, IsEnabled: true })
    .orWhere({ Reference: reference, EligibilityId: eligibilityId, ClaimId: null, IsEnabled: true })
}
