const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (claim, event, additionalData, note, isInternal) {
  var claimEvent = {
    'EligibilityId': claim.EligibilityId,
    'Reference': claim.Reference,
    'ClaimId': claim.ClaimId,
    'DateAdded': new Date(),
    'Event': event,
    'additionalData': additionalData,
    'note': note,
    'isInternal': isInternal
  }

  return knex('IntSchema.ClaimEvent').insert(claimEvent)
}
