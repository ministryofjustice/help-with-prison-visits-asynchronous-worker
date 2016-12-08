const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const statusEnum = require('../../constants/status-enum')

module.exports = function (reference, eligibilityId, claimId) {
  return getClaimDocumentsFromInternal(reference, eligibilityId, claimId)
    .then(function (documents) {
      var status = statusEnum.NEW
      documents.forEach(function (claimDocument) {
        if (claimDocument.DocumentStatus !== 'uploaded') {
          status = statusEnum.PENDING
        }
      })

      return updateClaimStatus(claimId, status)
    })
}

function getClaimDocumentsFromInternal (reference, eligibilityId, claimId) {
  return knex('IntSchema.ClaimDocument')
    .where({'Reference': reference, 'EligibilityId': eligibilityId, 'ClaimId': claimId, IsEnabled: true})
}

function updateClaimStatus (claimId, status) {
  return knex('IntSchema.Claim')
    .where({'ClaimId': claimId})
    .update({'Status': status})
}
