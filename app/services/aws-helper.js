const { v4: uuidv4 } = require('uuid')
const { S3 } = require('@aws-sdk/client-s3')
const fs = require('fs')
const log = require('./log')
const config = require('../../config')

class AWSHelper {
  constructor ({ bucketName = config.AWS_S3_BUCKET_NAME } = { }) {
    this.bucketName = bucketName
    this.s3 = new S3({})
  }

  async delete (key) {
    const deleteParams = {
      Bucket: this.bucketName,
      Key: key
    }

    try {
      await this.s3.deleteObject(deleteParams)
    } catch (error) {
      log.error(`Problem deleting file ${key}`)
      throw new Error(error)
    }
  }

  async upload (key, source) {
    const uploadParams = {
      Bucket: this.bucketName,
      Key: key,
      Body: ''
    }

    const fileStream = fs.createReadStream(source)
      .on('error', function (error) {
        log.error(`Error occurred reading from file ${source}`, error)
        throw new Error(error)
      })

    uploadParams.Body = fileStream

    try {
      const uploadResult = await this.s3.putObject(uploadParams)
      log.info('Upload Success', uploadResult.Location, key)
      return key
    } catch (error) {
      log.error(`Error occurred uploading file to s3 ${key}`, error)
      throw new Error(error)
    }
  }

  async download (key) {
    const downloadParams = {
      Bucket: this.bucketName,
      Key: key
    }
    const randomFilename = uuidv4()
    const tempFile = `${config.FILE_TMP_DIR}/${randomFilename}`

    try {
      const data = await this.s3.getObject(downloadParams)
      const fileData = await data.Body.transformToByteArray()
      fs.writeFileSync(tempFile, Buffer.from(fileData))
      log.info(`S3 Download Success ${key}`)
    } catch (error) {
      throw new Error(error)
    }

    return tempFile
  }
}

module.exports = {
  AWSHelper
}
