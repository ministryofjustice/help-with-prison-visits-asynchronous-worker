const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const dateFormatter = require('../date-formatter')

module.exports = function (reference, eligibilityId, claimId, visitorEmailAddress) {
  var autoApproval = {
    'EligibilityId': eligibilityId,
    'Reference': reference,
    'ClaimId': claimId,
    'EmailAddress': visitorEmailAddress,
    'DateAdded': dateFormatter.now().toDate()
  }

  return knex('IntSchema.AutoApproval').insert(autoApproval)
}
