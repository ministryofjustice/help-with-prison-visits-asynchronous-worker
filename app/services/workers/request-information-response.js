const moveClaimDocumentsToInternal = require('../data/move-claim-documents-to-internal')
const getAllClaimData = require('../data/get-all-claim-data')
const updateClaimStatus = require('../data/update-claim-status')
const autoApprovalProcess = require('../auto-approval/auto-approval-process')
const statusEnum = require('../../constants/status-enum')
const Promise = require('bluebird')

module.exports.execute = function (task) {
  var reference = task.reference
  var eligibilityId = task.eligibilityId
  var claimId = task.claimId
  var status

  return moveClaimDocumentsToInternal(reference, eligibilityId, claimId)
    .then(function () { return getAllClaimData('IntSchema', reference, eligibilityId, claimId) })
    .then(function (claimData) { status = getStatusForUpdatedClaim(claimData) })
    .then(function () { return updateClaimStatus(claimId, status) })
    .then(function () { return callAutoApprovalIfClaimIsNew(reference, eligibilityId, claimId, status) })
}

function getStatusForUpdatedClaim (claimData) {
  if (claimData.Claim.DateReviewed) {
    return statusEnum.UPDATED
  } else {
    return statusEnum.NEW
  }
}

function callAutoApprovalIfClaimIsNew (reference, eligibilityId, claimId, status) {
  if (status === statusEnum.NEW) {
    return autoApprovalProcess(reference, eligibilityId, claimId)
  } else {
    return Promise.resolve()
  }
}
