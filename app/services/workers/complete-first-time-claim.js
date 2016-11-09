const statusEnum = require('../../constants/status-enum')

const getAllFirstTimeClaimData = require('../data/get-all-first-time-claim-data')
const copyFirstTimeClaimDataToInternal = require('../data/copy-first-time-claim-data-to-internal')
const deleteFirstTimeClaimFromExternal = require('../data/delete-first-time-claim-from-external')
const insertTaskDwpCheck = require('../data/insert-task-dwp-check')

module.exports.execute = function (task) {
  var reference = task.reference
  var claimId = task.claimId

  return getAllFirstTimeClaimData(reference, claimId, statusEnum.SUBMITTED)
          .then(function (firstTimeClaimData) { return copyFirstTimeClaimDataToInternal(firstTimeClaimData) })
          .then(function () { return deleteFirstTimeClaimFromExternal(reference, claimId) })
          .then(function () { return insertTaskDwpCheck(reference, claimId) })
}
