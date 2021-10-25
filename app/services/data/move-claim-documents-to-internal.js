const { getDatabaseConnector } = require('../../databaseConnector')
const getClaimDocuments = require('./get-claim-documents')
const disableClaimDocument = require('./disable-claim-document')
const insertClaimEvent = require('./insert-claim-event')
const claimEventEnum = require('../../constants/claim-event-enum')
const log = require('../log')

module.exports = function (reference, eligibilityId, claimId) {
  let claimDocuments

  return getUpdatedClaimDocumentsFromExternal(reference, eligibilityId, claimId)
    .then(function (documents) { claimDocuments = documents })
    .then(function () { return disableOldClaimDocumentsInInternal(reference, eligibilityId, claimId, claimDocuments) })
    .then(function () { return copyClaimDocumentsToInternal(claimDocuments) })
    .then(function () { return deleteClaimDocumentsFromExternal(reference, eligibilityId, claimId) })
    .then(function () { return claimDocuments })
    .catch(function (error) {
      log.error(error)
    })
}

function getUpdatedClaimDocumentsFromExternal (reference, eligibilityId, claimId) {
  log.info('getUpdatedClaimDocumentsFromExternal / getClaimDocuments')
  return getClaimDocuments('ExtSchema', reference, eligibilityId, claimId)
}

function disableOldClaimDocumentsInInternal (reference, eligibilityId, claimId, claimDocuments) {
  log.info('disableOldClaimDocumentsInInternal / getClaimDocuments')
  return getClaimDocuments('IntSchema', reference, eligibilityId, claimId)
    .then(function (internalDocuments) {
      const oldDocumentsToDisable = matchOldInternalDocumentsToUpdatedDocuments(internalDocuments, claimDocuments)
      const promises = []

      oldDocumentsToDisable.forEach(function (oldDocumentToDisable) {
        promises.push(disableClaimDocument('IntSchema', oldDocumentToDisable.ClaimDocumentId))
        promises.push(insertClaimEventReplacedDocument(reference, eligibilityId, claimId, oldDocumentToDisable))
      })

      return Promise.all(promises)
    })
}

function copyClaimDocumentsToInternal (claimDocuments) {
  log.info('copyClaimDocumentsToInternal')
  const db = getDatabaseConnector()

  return db('IntSchema.ClaimDocument').insert(claimDocuments)
}

function deleteClaimDocumentsFromExternal (reference, eligibilityId, claimId) {
  log.info('deleteClaimDocumentsFromExternals')
  const db = getDatabaseConnector()

  return db('ExtSchema.ClaimDocument')
    .where({ Reference: reference, EligibilityId: eligibilityId }).del()
}

function matchOldInternalDocumentsToUpdatedDocuments (internalDocuments, updatedDocuments) {
  const oldDocuments = []
  internalDocuments.forEach(function (internalDocument) {
    const matchingNewDocuments = updatedDocuments.filter(function (newDocument) {
      if (internalDocument.DocumentType === newDocument.DocumentType &&
        internalDocument.ClaimExpenseId === newDocument.ClaimExpenseId) {
        return true
      } else {
        return false
      }
    })
    if (matchingNewDocuments && matchingNewDocuments.length > 0) {
      oldDocuments.push(internalDocument)
    }
  })

  return oldDocuments
}

function insertClaimEventReplacedDocument (reference, eligibilityId, claimId, oldDocumentToDisable) {
  if (oldDocumentToDisable.DocumentStatus === 'uploaded') {
    const note = `Replaced previous document ${oldDocumentToDisable.DocumentType}`
    log.info('insertClaimEventReplacedDocument / insertClaimEvent')
    return insertClaimEvent(reference, eligibilityId, claimId, oldDocumentToDisable.ClaimDocumentId, claimEventEnum.REPLACED_PREVIOUS_DOCUMENT.value, null, note, true)
  } else {
    return Promise.resolve()
  }
}
