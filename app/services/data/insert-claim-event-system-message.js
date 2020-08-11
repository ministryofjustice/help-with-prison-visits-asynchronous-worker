const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const dateFormatter = require('../date-formatter')

module.exports = function (reference, eligibilityId, claimId, claimDocumentId, event, additionalData, note, isInternal) {
  var claimEvent = {
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

  return knex('IntSchema.ClaimEvent').insert(claimEvent)
}
