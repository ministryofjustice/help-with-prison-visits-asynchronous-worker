const log = require('./log')
const config = require('../../config')
const AWS = require('aws-sdk')

class AWSHelper {
  constructor ({ accessKeyId = config.AWS_ACCESS_KEY_ID, secretAccessKey = config.AWS_SECRET_ACCESS_KEY, bucketName = config.AWS_S3_BUCKET_NAME } = { }) {
    this.accessKeyId = accessKeyId
    this.secretAccessKey = secretAccessKey
    this.bucketName = bucketName
    this.s3 = new AWS.S3({
      accessKeyId: this.accessKeyId,
      secretAccessKey: this.secretAccessKey
    })
  }

  delete (key) {
    const deleteParams = {
      Bucket: this.bucketName,
      Key: key
    }
    this.s3.deleteObject(deleteParams, function (err) {
      if (err) {
        log.error(`Problem deleting file ${key}`)
        throw new Error(err)
      }
    })
  }
}

module.exports = {
  AWSHelper
}
