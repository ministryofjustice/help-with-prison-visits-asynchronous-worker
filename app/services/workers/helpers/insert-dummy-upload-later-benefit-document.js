const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const dateFormatter = require('../../date-formatter')

module.exports = function (claimId, benefit, eligibilityId, reference) {
  return knex('IntSchema.ClaimDocument').insert({
    ClaimDocumentId: (Math.floor(Date.now() / 100) - 14000000000) + 2, // taken from internal-claim-document.helper.js on external web
    ClaimId: claimId,
    EligibilityId: eligibilityId,
    Reference: reference,
    DocumentType: benefit,
    DocumentStatus: 'upload-later',
    IsEnabled: true,
    DateSubmitted: dateFormatter.now().toDate()
  })
}