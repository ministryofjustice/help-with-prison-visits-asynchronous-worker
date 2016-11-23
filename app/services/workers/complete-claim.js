const statusEnum = require('../../constants/status-enum')

const getAllClaimData = require('../data/get-all-claim-data')
const copyClaimDataToInternal = require('../data/copy-claim-data-to-internal')
const deleteClaimFromExternal = require('../data/delete-claim-from-external')
const insertTaskDwpCheck = require('../data/insert-task-dwp-check')

module.exports.execute = function (task) {
  var reference = task.reference
  var eligibilityId = task.eligibilityId
  var claimId = task.claimId

  return getAllClaimData(reference, eligibilityId, claimId, statusEnum.SUBMITTED)
          .then(function (firstTimeClaimData) { return copyClaimDataToInternal(firstTimeClaimData) })
          .then(function () { return deleteClaimFromExternal(eligibilityId, claimId) })
          .then(function () { return insertTaskDwpCheck(reference, eligibilityId, claimId) })
}
