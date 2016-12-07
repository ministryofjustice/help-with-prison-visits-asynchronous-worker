const statusEnum = require('../../constants/status-enum')

const getAllClaimData = require('../data/get-all-claim-data')
const moveClaimDocumentsToInternalAndUpdateExisting = require('../data/move-claim-documents-to-internal-and-update-existing')
const updateClaimStatusIfAllDocumentsSupplied = require('../data/update-claim-status-if-all-documents-supplied')
const autoApprovalProcess = require('../auto-approval/auto-approval-process')

module.exports.execute = function (task) {
  var reference = task.reference
  var eligibilityId = task.eligibilityId
  var claimId = task.claimId
  var claimData

  return getAllClaimData(reference, eligibilityId, claimId, statusEnum.PENDING)
    .then(function (data) { claimData = data })
    .then(function () { return moveClaimDocumentsToInternalAndUpdateExisting(claimData) })
    .then(function () { return updateClaimStatusIfAllDocumentsSupplied(claimData) })
    .then(function () { return autoApprovalProcess(claimData) })
}
