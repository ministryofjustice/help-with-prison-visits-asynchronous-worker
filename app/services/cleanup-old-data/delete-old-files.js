const Promise = require('bluebird')
const getClaimDocuments = require('../data/get-claim-documents')
const log = require('../log')
const config = require('../../../config')
const AWS = require('aws-sdk')
const s3 = new AWS.S3({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY
})

module.exports = function (eligibilityId, claimId, reference) {
  return getClaimDocuments('ExtSchema', reference, eligibilityId, claimId)
    .then(function (claimDocuments) {
      claimDocuments.forEach(function (document) {
        if (document.Filepath) {
          const deleteParams = {
            Bucket: config.AWS_S3_BUCKET_NAME,
            Key: document.Filepath
          }
          s3.deleteObject(deleteParams, function (err) {
            if (err) {
              log.error(`Problem deleting file for Claim ${claimId} with path ${document.Filepath}`)
              throw new Error(err)
            }
          })
        }
      })
      return Promise.resolve()
    })
}
