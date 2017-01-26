const Promise = require('bluebird')
const config = require('../../../config')
const mv = Promise.promisify(require('mv'))

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
    var directoryToCopy = `${config.FILE_UPLOAD_LOCATION}/${reference}-${eligibilityId}`
    var targetDirectory = `${config.FILE_ARCHIVE_LOCATION}/${reference}-${eligibilityId}`

    if (!archiveEligibilityDocuments) {
      directoryToCopy = `${directoryToCopy}/${claimId}`
      targetDirectory = `${targetDirectory}/${claimId}`
    }

    return mv(directoryToCopy, targetDirectory, {mkdirp: true})
  } else {
    return Promise.resolve()
  }
}
