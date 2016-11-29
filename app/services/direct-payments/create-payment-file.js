const Promise = require('bluebird')
const stringify = Promise.promisify(require('csv-stringify'))
const writeFile = Promise.promisify(require('fs').writeFile)
const fs = require('fs')
const path = require('path')
const moment = require('moment')
const config = require('../../../config')

const dataPath = config.DATA_FILE_PATH
const outputPath = path.join(dataPath, config.PAYMENT_FILE_PATH)

module.exports = function (payments) {
  const filePath = path.join(outputPath, getFileName())
  const header = [['sort code', 'account number', 'name', 'amount', 'reference']]
  const data = header.concat(payments)
  mkdirIfNotExists(dataPath)
  mkdirIfNotExists(outputPath)

  return stringify(data).then(function (content) {
    writeFile(filePath, content, {})
    return Promise.resolve(filePath)
  })
}

function mkdirIfNotExists (dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}

function getFileName () {
  const datestamp = moment().format('YYYYMMDD')
  return `apvs-payments-${datestamp}.csv`
}
