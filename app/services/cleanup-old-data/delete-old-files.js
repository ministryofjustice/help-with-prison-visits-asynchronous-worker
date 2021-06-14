const getClaimDocuments = require('../data/get-claim-documents')
const { AWSHelper } = require('../aws-helper')
const aws = new AWSHelper()

module.exports = function (eligibilityId, claimId, reference) {
  return getClaimDocuments('ExtSchema', reference, eligibilityId, claimId)
    .then(function (claimDocuments) {
      claimDocuments.forEach(async function (document) {
        if (document.Filepath) {
          await aws.delete(document.Filepath)
        }
      })
      return Promise.resolve()
    })
}
