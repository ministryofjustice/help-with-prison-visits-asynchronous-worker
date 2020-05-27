const Promise = require('bluebird')
const config = require('../../../config')
const mv = Promise.promisify(require('mv'))
const fs = require('fs')
const path = require('path')

module.exports = function (archivedClaimData) {
  var archiveEligibilityDocuments = archivedClaimData.DeleteEligibility
  var reference = archivedClaimData.Claim.Reference
  var eligibilityId = archivedClaimData.Claim.EligibilityId
  var claimId = archivedClaimData.Claim.ClaimId
  var hasDocuments = false

  if (archivedClaimData.ClaimDocument) {
    archivedClaimData.ClaimDocument.forEach(function (claimDocument) {
      if (claimDocument.Filepath) {
        hasDocuments = true
      }
    })
  }

  if (hasDocuments) {
    var claimDirectory = `${config.FILE_UPLOAD_LOCATION}/${reference}-${eligibilityId}/${claimId}`
    var archiveClaimDirectory = `${config.FILE_ARCHIVE_LOCATION}/${reference}-${eligibilityId}/${claimId}`

    return mv(claimDirectory, archiveClaimDirectory, { mkdirp: true })
      .then(function () {
        if (archiveEligibilityDocuments) {
          var eligibilityDirectory = `${config.FILE_UPLOAD_LOCATION}/${reference}-${eligibilityId}`
          var targetDirectory = `${config.FILE_ARCHIVE_LOCATION}/${reference}-${eligibilityId}`

          var allEligibilityFilesFolders = fs.readdirSync(eligibilityDirectory)

          if (allEligibilityFilesFolders && allEligibilityFilesFolders.length > 0) {
            var movePromises = []

            allEligibilityFilesFolders.forEach(function (eligibilityFileOrFolder) {
              var eligibilityFileOrFolderPath = path.join(eligibilityDirectory, eligibilityFileOrFolder)
              var targetFileOrFolderPath = path.join(targetDirectory, eligibilityFileOrFolder)

              movePromises.push(mv(eligibilityFileOrFolderPath, targetFileOrFolderPath, { mkdirp: true }))
            })
            return Promise.all(movePromises)
              .then(function () {
                fs.rmdirSync(eligibilityDirectory)
              })
          } else {
            fs.rmdirSync(eligibilityDirectory)
          }
        }

        return Promise.resolve()
      })
  } else {
    return Promise.resolve()
  }
}
