const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)

module.exports = function (reference, eligibilityId, claimId) {
  var claimDocuments

  return getClaimDocumentsFromExternal(reference, eligibilityId, claimId)
    .then(function (documents) { claimDocuments = documents })
    .then(function () { return copyClaimDocumentsToInternal(claimDocuments) })
    .then(function () { return deleteClaimDocumentsFromExternal(reference, eligibilityId, claimId) })
    .then(function () { return claimDocuments })
}

function getClaimDocumentsFromExternal (reference, eligibilityId, claimId) {
  return knex('ExtSchema.ClaimDocument')
    .where({'Reference': reference, 'EligibilityId': eligibilityId, 'ClaimId': claimId, IsEnabled: true})
}

function copyClaimDocumentsToInternal (claimDocuments) {
  return knex('IntSchema.ClaimDocument').insert(claimDocuments)
}

function deleteClaimDocumentsFromExternal (reference, eligibilityId, claimId) {
  return knex('ExtSchema.ClaimDocument')
    .where({'Reference': reference, 'EligibilityId': eligibilityId, 'ClaimId': claimId}).del()
}
