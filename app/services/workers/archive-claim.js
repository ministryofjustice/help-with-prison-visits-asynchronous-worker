const moveClaimDataToArchiveDatabase = require('../archiving/move-claim-data-to-archive-database')

module.exports.execute = task => {
  const { claimId } = task

  return moveClaimDataToArchiveDatabase(claimId)
}
