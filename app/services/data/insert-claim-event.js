const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (reference, eligibilityId, claimId, claimDocumentId, event, additionalData, note, isInternal) {
  var claimEvent = {
    'EligibilityId': eligibilityId,
    'Reference': reference,
    'ClaimId': claimId,
    'ClaimDocumentId': claimDocumentId,
    'DateAdded': new Date(),
    'Event': event,
    'additionalData': additionalData,
    'note': note,
    'isInternal': isInternal
  }

  return knex('IntSchema.ClaimEvent').insert(claimEvent)
}
