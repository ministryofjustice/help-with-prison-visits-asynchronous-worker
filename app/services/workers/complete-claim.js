const getAllClaimData = require('../data/get-all-claim-data')
const copyClaimDataToInternal = require('../data/copy-claim-data-to-internal')
const deleteClaimFromExternal = require('../data/delete-claim-from-external')
const autoApprovalProcess = require('../auto-approval/auto-approval-process')
const insertTask = require('../data/insert-task')
const tasksEnum = require('../../constants/tasks-enum')

module.exports.execute = function (task) {
  var reference = task.reference
  var eligibilityId = task.eligibilityId
  var claimId = task.claimId
  var claimData

  return getAllClaimData('ExtSchema', reference, eligibilityId, claimId)
    .then(function (data) { claimData = data })
    .then(function () { return copyClaimDataToInternal(claimData, task.additionalData) })
    .then(function () { return deleteClaimFromExternal(eligibilityId, claimId) })
    .then(function () { return autoApprovalProcess(reference, eligibilityId, claimId) })
    .then(function () { return insertTask(reference, eligibilityId, claimId, tasksEnum.DWP_CHECK) })
}
