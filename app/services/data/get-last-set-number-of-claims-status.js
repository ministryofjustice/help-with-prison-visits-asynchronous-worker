const { getDatabaseConnector } = require('../../databaseConnector')

module.exports = (reference, claimId, numberOfClaims) => {
  const db = getDatabaseConnector()

  return db('IntSchema.Claim')
    .select('Status')
    .where({ Reference: reference })
    .whereNot({ ClaimId: claimId })
    .orderBy('DateSubmitted', 'desc')
    .limit(numberOfClaims)
}
