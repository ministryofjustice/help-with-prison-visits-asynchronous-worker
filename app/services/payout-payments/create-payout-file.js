const Promise = require('bluebird')
const stringify = Promise.promisify(require('csv-stringify'))
const writeFile = Promise.promisify(require('fs').writeFile)
const fs = require('fs')
const path = require('path')
const dateFormatter = require('../date-formatter')
const config = require('../../../config')
const log = require('../log')
const _ = require('lodash')
const AWS = require('aws-sdk')
const s3 = new AWS.S3({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY
})

module.exports = function (payments) {
  const filename = getFileName()
  const tempFilePath = path.join(config.FILE_TMP_DIR, filename)
  const formattedPayments = stripSpecialCharacters(payments)
  const length = formattedPayments.length

  log.info(`Generating payout file with ${length} payments`)
  return stringify(formattedPayments).then(function (content) {
    return writeFile(tempFilePath, content, {})
      .then(function () {
        log.info(`Filename for payout payment file = ${filename}`)
        const uploadParams = {
          Bucket: config.AWS_S3_BUCKET_NAME,
          Key: filename,
          Body: ''
        }

        const fileStream = fs.createReadStream(tempFilePath)
          .on('error', function (error) {
            log.error('Error occurred reading from file ' + tempFilePath)
            throw new Error(error)
          })

        uploadParams.Body = fileStream

        // call S3 to retrieve upload file to specified bucket
        s3.upload(uploadParams, function (err, data) {
          if (err) {
            log.error('Error', err)
          } if (data) {
            log.info('Upload Success', data.Location)
            return filename
          }
        })
      })
  })
}

function getFileName () {
  const datestamp = dateFormatter.now().format('DDMMYYYY')
  return `${config.PAYOUT_FILENAME_PREFIX}${datestamp}${config.PAYOUT_FILENAME_POSTFIX}.csv`
}

function stripSpecialCharacters (payments) {
  const replaceCharacters = string => string.replace(/[^a-zA-Z0-9-. ]/g, '')
  return _.map(payments, paymentRow => _.map(paymentRow, replaceCharacters))
}
