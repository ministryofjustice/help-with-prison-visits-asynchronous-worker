const dateFormatter = require('../date-formatter')
const config = require('../../../config')
const getAllClaimsOlderThanDate = require('../data/get-all-claims-older-than-date')
const insertTask = require('../data/insert-task')
const tasksEnum = require('../../constants/tasks-enum')

module.exports.execute = function () {
  const archiveClaimsAfterDays = parseInt(config.ARCHIVE_CLAIMS_AFTER_DAYS, 10)
  const archiveClaimsOlderThan = dateFormatter.now().subtract(archiveClaimsAfterDays, 'days').toDate()

  return getAllClaimsOlderThanDate(archiveClaimsOlderThan).then(function (claimIdsToArchive) {
    const insertArchiveClaimTasks = []

    if (claimIdsToArchive) {
      claimIdsToArchive.forEach(function (result) {
        insertArchiveClaimTasks.push(insertTask(null, null, result.ClaimId, tasksEnum.ARCHIVE_CLAIM))
      })
    }

    return Promise.all(insertArchiveClaimTasks)
  })
}
