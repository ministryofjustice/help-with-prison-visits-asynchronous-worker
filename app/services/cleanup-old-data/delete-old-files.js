const Promise = require('bluebird')
const fs = require('fs')
const getClaimDocuments = require('../data/get-claim-documents')
const log = require('../log')

module.exports = function (eligibilityId, claimId, reference) {
  return getClaimDocuments('ExtSchema', reference, eligibilityId, claimId)
    .then(function (claimDocuments) {
      claimDocuments.forEach(function (document) {
        if (document.Filepath) {
          try {
            fs.unlinkSync(document.Filepath)
          } catch (error) {
            if (error.code === 'ENOENT') {
              log.error(`File for Claim ${claimId} with path ${document.Filepath} does not exist`)
            } else {
              throw error
            }
          }
        }
      })
      return Promise.resolve()
    })
}
