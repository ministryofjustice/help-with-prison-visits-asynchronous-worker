const { getDatabaseConnector } = require('../../databaseConnector')
const dateFormatter = require('../date-formatter')

module.exports = function (reference, eligibilityId, claimId, claimDocumentId, event, additionalData, note, isInternal) {
  const claimEvent = {
    EligibilityId: eligibilityId,
    Reference: reference,
    CaseWorker: 'System Message',
    ClaimId: claimId,
    ClaimDocumentId: claimDocumentId,
    DateAdded: dateFormatter.now().toDate(),
    Event: event,
    additionalData: additionalData,
    note: note,
    isInternal: isInternal
  }
  const db = getDatabaseConnector()

  return db('IntSchema.ClaimEvent').insert(claimEvent)
}
