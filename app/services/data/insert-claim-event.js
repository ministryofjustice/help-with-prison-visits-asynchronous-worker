const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
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
    return knex('IntSchema.ClaimEvent').insert(claimEvent)
  }
}
