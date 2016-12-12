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
  var note = task.additionalInfo
  var updatedDocuments
  var status

  return moveClaimDocumentsToInternal(reference, eligibilityId, claimId)
    .then(function (newDocuments) { updatedDocuments = newDocuments })
    .then(function () { return getAllClaimData('IntSchema', reference, eligibilityId, claimId) })
    .then(function (claimData) { status = getStatusForUpdatedClaim(claimData) })
    .then(function () { return updateClaimStatus(claimId, status) })
    .then(function () { return insertClaimEventForUpdate(reference, eligibilityId, claimId, updatedDocuments, note) })
    .then(function () { return callAutoApprovalIfClaimIsNew(reference, eligibilityId, claimId, status) })
}

function getStatusForUpdatedClaim (claimData) {
console.dir(claimData.Claim)
  if (claimData.Claim.DateReviewed) {
console.log('updated')
    return statusEnum.UPDATED
  } else {
console.log('new')
    return statusEnum.NEW
  }
}

function insertClaimEventForUpdate (reference, eligibilityId, claimId, updatedDocuments, note) {
  return insertClaimEvent(reference, eligibilityId, claimId, 'CLAIM-UPDATED', null, generateClaimUpdatedString(note, updatedDocuments), false)
}

function callAutoApprovalIfClaimIsNew (reference, eligibilityId, claimId, status) {
  if (status === statusEnum.NEW) {
    return autoApprovalProcess(reference, eligibilityId, claimId)
  } else {
    return Promise.resolve()
  }
}
