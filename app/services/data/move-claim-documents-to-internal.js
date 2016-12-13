const config = require('../../../knexfile').asyncworker
const knex = require('knex')(config)
const getClaimDocuments = require('./get-claim-documents')
const disableClaimDocument = require('./disable-claim-document')
const insertClaimEvent = require('./insert-claim-event')
const Promise = require('bluebird')

module.exports = function (reference, eligibilityId, claimId) {
  var claimDocuments

  return getUpdatedClaimDocumentsFromExternal(reference, eligibilityId, claimId)
    .then(function (documents) { claimDocuments = documents })
    .then(function () { return disableOldClaimDocumentsInInternal(reference, eligibilityId, claimId, claimDocuments) })
    .then(function () { return copyClaimDocumentsToInternal(claimDocuments) })
    .then(function () { return deleteClaimDocumentsFromExternal(reference, eligibilityId, claimId) })
    .then(function () { return claimDocuments })
}

function getUpdatedClaimDocumentsFromExternal (reference, eligibilityId, claimId) {
  return getClaimDocuments('ExtSchema', reference, eligibilityId, claimId)
}

function disableOldClaimDocumentsInInternal (reference, eligibilityId, claimId, claimDocuments) {
  return getClaimDocuments('IntSchema', reference, eligibilityId, claimId)
    .then(function (internalDocuments) {
      var oldDocumentsToDisable = matchOldInternalDocumentsToUpdatedDocuments(internalDocuments, claimDocuments)
      var promises = []

      oldDocumentsToDisable.forEach(function (oldDocumentToDisable) {
        promises.push(disableClaimDocument('IntSchema', oldDocumentToDisable.ClaimDocumentId))
        promises.push(insertClaimEventReplacedDocument(reference, eligibilityId, claimId, oldDocumentToDisable))
      })

      return Promise.all(promises)
    })
}

function copyClaimDocumentsToInternal (claimDocuments) {
  return knex('IntSchema.ClaimDocument').insert(claimDocuments)
}

function deleteClaimDocumentsFromExternal (reference, eligibilityId, claimId) {
  return knex('ExtSchema.ClaimDocument')
    .where({'Reference': reference, 'EligibilityId': eligibilityId, 'ClaimId': claimId}).del()
}

function matchOldInternalDocumentsToUpdatedDocuments (internalDocuments, updatedDocuments) {
  var oldDocuments = []
  internalDocuments.forEach(function (internalDocument) {
    var matchingNewDocuments = updatedDocuments.filter(function (newDocument) {
      if (internalDocument.DocumentType === newDocument.DocumentType &&
        internalDocument.ClaimExpenseId === newDocument.ClaimExpenseId) {
        return true
      }
    })
    if (matchingNewDocuments.length > 0) {
      oldDocuments.push(internalDocument)
    }
  })

  return oldDocuments
}

function insertClaimEventReplacedDocument (reference, eligibilityId, claimId, oldDocumentToDisable) {
  const note = `Replaced previous document ${oldDocumentToDisable.DocumentType}`
  return insertClaimEvent(reference, eligibilityId, claimId, oldDocumentToDisable.ClaimDocumentId, 'REPLACED-PREVIOUS-DOCUMENT', null, note, true)
}
