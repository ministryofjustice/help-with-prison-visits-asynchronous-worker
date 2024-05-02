const moveClaimDataToArchiveDatabase = require('../archiving/move-claim-data-to-archive-database')

module.exports.execute = function (task) {
  const { claimId } = task

  return moveClaimDataToArchiveDatabase(claimId)
}
