const Promise = require('bluebird')
const config = require('../../../config')
const mv = Promise.promisify(require('mv'))
const fs = require('fs')
const path = require('path')

module.exports = function (archivedClaimData) {
  const archiveEligibilityDocuments = archivedClaimData.DeleteEligibility
  const reference = archivedClaimData.Claim.Reference
  const eligibilityId = archivedClaimData.Claim.EligibilityId
  const claimId = archivedClaimData.Claim.ClaimId
  let hasDocuments = false

  if (archivedClaimData.ClaimDocument) {
    archivedClaimData.ClaimDocument.forEach(function (claimDocument) {
      if (claimDocument.Filepath) {
        hasDocuments = true
      }
    })
  }

  if (hasDocuments) {
    const claimDirectory = `${config.FILE_UPLOAD_LOCATION}/${reference}-${eligibilityId}/${claimId}`
    const archiveClaimDirectory = `${config.FILE_ARCHIVE_LOCATION}/${reference}-${eligibilityId}/${claimId}`

    return mv(claimDirectory, archiveClaimDirectory, { mkdirp: true })
      .then(function () {
        if (archiveEligibilityDocuments) {
          const eligibilityDirectory = `${config.FILE_UPLOAD_LOCATION}/${reference}-${eligibilityId}`
          const targetDirectory = `${config.FILE_ARCHIVE_LOCATION}/${reference}-${eligibilityId}`

          const allEligibilityFilesFolders = fs.readdirSync(eligibilityDirectory)

          if (allEligibilityFilesFolders && allEligibilityFilesFolders.length > 0) {
            const movePromises = []

            allEligibilityFilesFolders.forEach(function (eligibilityFileOrFolder) {
              const eligibilityFileOrFolderPath = path.join(eligibilityDirectory, eligibilityFileOrFolder)
              const targetFileOrFolderPath = path.join(targetDirectory, eligibilityFileOrFolder)

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
