const Promise = require('bluebird')
const stringify = Promise.promisify(require('csv-stringify'))
const writeFile = Promise.promisify(require('fs').writeFile)
const fs = require('fs')
const path = require('path')
const dateFormatter = require('../date-formatter')
const config = require('../../../config')
const log = require('../log')

const dataPath = config.DATA_FILE_PATH
const outputPath = path.join(dataPath, config.PAYMENT_FILE_PATH)

module.exports = function (payments) {
  const filePath = path.join(outputPath, getFileName())
  const header = [['sort code', 'account number', 'name', 'amount', 'reference']]
  const data = header.concat(payments)
  mkdirIfNotExists(dataPath)
  mkdirIfNotExists(outputPath)

  return stringify(data).then(function (content) {
    return writeFile(filePath, content, {})
      .then(function () {
        log.info(`Filepath for direct payment file = ${filePath}`)
        return filePath
      })
  })
}

function mkdirIfNotExists (dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}

function getFileName () {
  const datestamp = dateFormatter.now().format('YYYYMMDDHHmmss')
  return `apvs-payments-${datestamp}.csv`
}
