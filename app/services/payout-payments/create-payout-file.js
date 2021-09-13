const util = require('util')
const stringify = util.promisify(require('csv-stringify'))
const writeFile = util.promisify(require('fs').writeFile)
const path = require('path')
const dateFormatter = require('../date-formatter')
const config = require('../../../config')
const log = require('../log')
const _ = require('lodash')
const { AWSHelper } = require('../aws-helper')
const aws = new AWSHelper()

module.exports = function (payments) {
  const filename = getFileName()
  const tempFilePath = path.join(config.FILE_TMP_DIR, filename)
  const formattedPayments = stripSpecialCharacters(payments)
  const length = formattedPayments.length

  log.info(`Generating payout file with ${length} payments`)
  return stringify(formattedPayments).then(function (content) {
    return writeFile(tempFilePath, content, {})
      .then(async function () {
        log.info(`Filename for payout payment file = ${filename}`)
        return await aws.upload(filename, tempFilePath)
      })
  })
}

function getFileName () {
  const datestamp = dateFormatter.now().format('DDMMYYYY')
  return `${config.PAYMENT_FILE_FOLDER}/${config.PAYOUT_FILENAME_PREFIX}${datestamp}${config.PAYOUT_FILENAME_POSTFIX}.csv`
}

function stripSpecialCharacters (payments) {
  const replaceCharacters = string => string.replace(/[^a-zA-Z0-9-. ]/g, '')
  return _.map(payments, paymentRow => _.map(paymentRow, replaceCharacters))
}
