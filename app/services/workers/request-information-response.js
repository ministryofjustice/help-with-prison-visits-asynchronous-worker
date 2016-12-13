const moveClaimDocumentsToInternal = require('../data/move-claim-documents-to-internal')
const getAllClaimData = require('../data/get-all-claim-data')
const updateClaimStatus = require('../data/update-claim-status')
const insertClaimEvent = require('../data/insert-claim-event')
const generateClaimUpdatedString = require('../notify/helpers/generate-claim-updated-string')
const autoApprovalProcess = require('../auto-approval/auto-approval-process')
const statusEnum = require('../../constants/status-enum')
const Promise = require('bluebird')

module.exports.execute = function (task) {
  var reference = task.reference
  var eligibilityId = task.eligibilityId
  var claimId = task.claimId
  var note = task.additionalData
  var updatedDocuments
  var status

  return moveClaimDocumentsToInternal(reference, eligibilityId, claimId)
    .then(function (newDocuments) { updatedDocuments = newDocuments })
    .then(function () { return getAllClaimData('IntSchema', reference, eligibilityId, claimId) })
    .then(function (claimData) { status = getStatusForUpdatedClaim(claimData) })
    .then(function () { return updateClaimStatus(claimId, status) })
    .then(function () { return insertClaimEventsForUpdate(reference, eligibilityId, claimId, updatedDocuments, note) })
    .then(function () { return callAutoApprovalIfClaimIsNew(reference, eligibilityId, claimId, status) })
}

function getStatusForUpdatedClaim (claimData) {
  if (claimData.Claim.DateReviewed) {
    return statusEnum.UPDATED
  } else {
    return statusEnum.NEW
  }
}

function insertClaimEventsForUpdate (reference, eligibilityId, claimId, updatedDocuments, note) {
  return insertClaimEvent(reference, eligibilityId, claimId, null, 'CLAIM-UPDATED', null, generateClaimUpdatedString(note, updatedDocuments), true)
    .then(function () {
      var uploadedDocuments = updatedDocuments.filter(function (updatedDocument) { return updatedDocument.DocumentStatus === 'uploaded' })
      var insertUploadedDocumentEventPromises = []

      uploadedDocuments.forEach(function (uploadedDocument) {
        insertUploadedDocumentEventPromises.push(insertClaimEventForUploadedDocument(reference, eligibilityId, claimId, uploadedDocument))
      })

      return Promise.all(insertUploadedDocumentEventPromises)
    })
}

function insertClaimEventForUploadedDocument (reference, eligibilityId, claimId, uploadedDocument) {
  const note = `Uploaded new document ${uploadedDocument.DocumentType}`
  return insertClaimEvent(reference, eligibilityId, claimId, uploadedDocument.ClaimDocumentId, 'NEW-DOCUMENT-UPLOADED', null, note, true)
}

function callAutoApprovalIfClaimIsNew (reference, eligibilityId, claimId, status) {
  if (status === statusEnum.NEW) {
    return autoApprovalProcess(reference, eligibilityId, claimId)
  } else {
    return Promise.resolve()
  }
}
