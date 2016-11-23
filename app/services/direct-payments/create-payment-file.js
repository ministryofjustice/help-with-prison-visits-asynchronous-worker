const stringify = require('csv-stringify')
const logger = require('../log')
const fs = require('fs')
const moment = require('moment')
const config = require('../../../config')

const outputPath = config.PAYMENT_FILE_PATH

module.exports = function (payments) {
  const content = getFileContent(payments)
  const filePath = outputPath + getFileName()

  fs.writeFile(filePath, content, function (error) {
    return logger.error(error)
  })

  return filePath
}

function getFileContent (payments) {
  const header = ['sort code', 'account number', 'name', 'amount', 'reference']
  const data = header.concat(payments)

  stringify(data, function (error, output) {
    if (error) {
      logger.error(error)
    }

    return output
  })
}

function getFileName () {
  const datestamp = moment().format('YYYYMMDD')
  return `apvs-payments-${datestamp}.csv`
}
