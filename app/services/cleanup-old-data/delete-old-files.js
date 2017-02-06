const Promise = require('bluebird')
const fs = require('fs')
const getClaimDocuments = require('../data/get-claim-documents')

module.exports = function (eligibilityId, claimId, reference) {
  return getClaimDocuments('ExtSchema', reference, eligibilityId, claimId)
    .then(function (claimDocuments) {
      claimDocuments.forEach(function (document) {
        if (document.Filepath) {
          fs.unlinkSync(document.Filepath)
        }
      })
      return Promise.resolve()
    })
}
