const moveClaimDataToArchiveDatabase = require('../archiving/move-claim-data-to-archive-database')
const moveClaimFilesToArchiveFileStore = require('../archiving/move-claim-files-to-archive-file-store')

module.exports.execute = function (task) {
  const claimId = task.claimId

  return moveClaimDataToArchiveDatabase(claimId)
    .then(function (archivedClaimData) {
      return moveClaimFilesToArchiveFileStore(archivedClaimData)
    })
}
