const getClaimDocuments = require('../data/get-claim-documents')
const AWSHelper = require('../aws-helper')

const aws = new AWSHelper()

module.exports = (eligibilityId, claimId, reference) => {
  return getClaimDocuments('ExtSchema', reference, eligibilityId, claimId).then(claimDocuments => {
    claimDocuments.forEach(async document => {
      if (document.Filepath) {
        await aws.delete(document.Filepath)
      }
    })
    return Promise.resolve()
  })
}
