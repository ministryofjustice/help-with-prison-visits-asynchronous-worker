const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const Promise = require('bluebird')

module.exports = function (reference, eligibilityId, claimId) {
  var claimDocuments

  return getClaimDocumentsFromExternal(reference, eligibilityId, claimId)
    .then(function (documents) { claimDocuments = documents })
    .then(function () { return updateExistingInternalClaimDocuments(claimId, claimDocuments) })
    .then(function () { return copyClaimDocumentsToInternal(claimDocuments) })
    .then(function () { return deleteClaimDocumentsFromExternal(reference, eligibilityId, claimId) })
}

function getClaimDocumentsFromExternal (reference, eligibilityId, claimId) {
  return knex('ExtSchema.ClaimDocument')
    .where({'Reference': reference, 'EligibilityId': eligibilityId, 'ClaimId': claimId, IsEnabled: true})
}

function updateExistingInternalClaimDocuments (claimId, claimDocuments) {
  var claimDocumentUpdates = []

  claimDocuments.forEach(function (claimDocument) {
    claimDocumentUpdates.push(disableMatchingExistingInternalClaimDocuments(claimId, claimDocument))
  })

  return Promise.all(claimDocumentUpdates)
}

function disableMatchingExistingInternalClaimDocuments (claimId, claimDocument) {
  return knex('IntSchema.ClaimDocument')
    .where({ClaimId: claimId, ClaimExpenseId: claimDocument.ClaimExpenseId, DocumentType: claimDocument.DocumentType})
    .update({IsEnabled: false})
}

function copyClaimDocumentsToInternal (claimDocuments) {
  return knex('IntSchema.ClaimDocument').insert(claimDocuments)
}

function deleteClaimDocumentsFromExternal (reference, eligibilityId, claimId) {
  return knex('ExtSchema.ClaimDocument')
    .where({'Reference': reference, 'EligibilityId': eligibilityId, 'ClaimId': claimId}).del()
}
