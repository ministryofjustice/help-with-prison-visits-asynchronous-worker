const { getDatabaseConnector } = require('../../databaseConnector')
const dateFormatter = require('../date-formatter')

module.exports = function (reference, eligibilityId, claimId, visitorEmailAddress) {
  const autoApproval = {
    EligibilityId: eligibilityId,
    Reference: reference,
    ClaimId: claimId,
    EmailAddress: visitorEmailAddress,
    DateAdded: dateFormatter.now().toDate()
  }
  const db = getDatabaseConnector()

  return db('IntSchema.AutoApproval').insert(autoApproval)
}
