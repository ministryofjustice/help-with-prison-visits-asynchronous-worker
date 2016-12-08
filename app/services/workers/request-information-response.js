const moveClaimDocumentsToInternalAndUpdateExisting = require('../data/move-claim-documents-to-internal-and-update-existing')
const updateClaimStatusIfAllDocumentsSupplied = require('../data/update-claim-status-if-all-documents-supplied')
const autoApprovalProcess = require('../auto-approval/auto-approval-process')

module.exports.execute = function (task) {
  var reference = task.reference
  var eligibilityId = task.eligibilityId
  var claimId = task.claimId

  return moveClaimDocumentsToInternalAndUpdateExisting(reference, eligibilityId, claimId)
    .then(function () { return updateClaimStatusIfAllDocumentsSupplied(reference, eligibilityId, claimId) })
    .then(function () { return autoApprovalProcess(reference, eligibilityId, claimId) })
}
