const { getDatabaseConnector } = require('../../databaseConnector')
const dateFormatter = require('../date-formatter')

module.exports = function (reference, eligibilityId, claimId, claimDocumentId, event, additionalData, note, isInternal, trx) {
  const claimEvent = {
    EligibilityId: eligibilityId,
    Reference: reference,
    ClaimId: claimId,
    ClaimDocumentId: claimDocumentId,
    DateAdded: dateFormatter.now().toDate(),
    Event: event,
    additionalData: additionalData,
    note: note,
    isInternal: isInternal
  }

  if (trx) {
    return trx('IntSchema.ClaimEvent').insert(claimEvent)
  } else {
    const db = getDatabaseConnector()

    return db('IntSchema.ClaimEvent').insert(claimEvent)
  }
}
