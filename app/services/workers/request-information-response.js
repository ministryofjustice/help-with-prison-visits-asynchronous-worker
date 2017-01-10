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
  var originalStatus
  var claimBankDetailId

  return moveClaimDocumentsToInternal(reference, eligibilityId, claimId)
    .then(function (newDocuments) { updatedDocuments = newDocuments })
    .then(function () { return getAllClaimData('IntSchema', reference, eligibilityId, claimId) })
    .then(function (claimData) {
      status = getStatusForUpdatedClaim(claimData)
      originalStatus = claimData.Claim.Status
      claimBankDetailId = claimData.ClaimBankDetailId
    })
    .then(function () { return updateBankDetails(reference, eligibilityId, claimId, originalStatus, claimBankDetailId) })
    .then(function () { return updateClaimStatus(claimId, status) })
    .then(function () { return insertClaimEventForUpdate(reference, eligibilityId, claimId, updatedDocuments) })
    .then(function () { return insertClaimEventForNote(reference, eligibilityId, claimId, note) })
    .then(function () { return callAutoApprovalIfClaimIsNew(reference, eligibilityId, claimId, status) })
}

function getStatusForUpdatedClaim (claimData) {
  if (claimData.Claim.DateReviewed) {
    return statusEnum.UPDATED
  } else {
    return statusEnum.NEW
  }
}

function insertClaimEventForNote (reference, eligibilityId, claimId, note) {
  return insertClaimEvent(reference, eligibilityId, claimId, null, 'NEW-DOCUMENT-UPLOADED', null, note, false)
}

function insertClaimEventForUpdate (reference, eligibilityId, claimId, updatedDocuments) {
  if (updatedDocuments && updatedDocuments.length > 0) {
    return insertClaimEvent(reference, eligibilityId, claimId, null, 'CLAIM-UPDATED', null, generateClaimUpdatedString(updatedDocuments), true)
  } else {
    return Promise.resolve()
  }
}

function callAutoApprovalIfClaimIsNew (reference, eligibilityId, claimId, status) {
  if (status === statusEnum.NEW) {
    return autoApprovalProcess(reference, eligibilityId, claimId)
  } else {
    return Promise.resolve()
  }
}

function updateBankDetails (reference, eligibilityId, claimId, status, claimBankDetailId) {
  if (status === statusEnum.REQUEST_INFO_PAYMENT) {
    return Promise.resolve()
  } else {
    return Promise.resolve()
  }
}
