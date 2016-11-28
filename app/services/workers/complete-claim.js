const statusEnum = require('../../constants/status-enum')

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

  return getAllClaimData(reference, eligibilityId, claimId, statusEnum.SUBMITTED)
    .then(function (data) {
      claimData = data
      return copyClaimDataToInternal(data, task.additionalData)
    })
    .then(function () { return deleteClaimFromExternal(eligibilityId, claimId) })
    .then(function () { return autoApprovalProcess(claimData) })
    .then(function () { return insertTask(reference, eligibilityId, claimId, tasksEnum.DWP_CHECK) })
}
