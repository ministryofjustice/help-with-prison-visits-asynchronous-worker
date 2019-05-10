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
  const data = formatPaymentsToCsvStandard(payments)
  mkdirIfNotExists(dataPath)
  mkdirIfNotExists(outputPath)

  var length = payments.length
  log.info(`Generating direct bank payments file with ${length} payments`)

  return stringify(data).then(function (content) {
    return writeFile(filePath, content, {})
      .then(function () {
        log.info(`Filepath for direct payment file = ${filePath}`)
        return filePath
      })
  })
}

function formatPaymentsToCsvStandard (payments) {
  var csvFormattedPayments = []

  var niTotal = 0
  var engTotal = 0
  var walTotal = 0
  var scoTotal = 0
  payments.forEach(function (payment) {
    var cost = parseFloat(payment[3])
    switch (payment[5]) {
      case 'England':
        engTotal = engTotal + cost
        break
      case 'Northern Ireland':
        niTotal = niTotal + cost
        break
      case 'Scotland':
        scoTotal = scoTotal + cost
        break
      case 'Wales':
        walTotal = walTotal + cost
        break
    }
    csvFormattedPayments.push([
      payment[0],                                         // sortcode
      payment[1],                                         // account number
      getNameAs18CharactersPaddedWithSpaces(payment[2]),  // payee
      getAmountAs11CharactersPaddedWithZeros(payment[3]), // amount
      payment[4],                                         // reference
      payment[5]                                          // country
    ])
  })

  csvFormattedPayments.push([])
  csvFormattedPayments.push(['Country', 'Total Amount'])
  csvFormattedPayments.push(['England', engTotal.toFixed(2)])
  csvFormattedPayments.push(['Northern Ireland', niTotal.toFixed(2)])
  csvFormattedPayments.push(['Wales', walTotal.toFixed(2)])
  csvFormattedPayments.push(['Scotland', scoTotal.toFixed(2)])

  return csvFormattedPayments
}

function getNameAs18CharactersPaddedWithSpaces (name) {
  var trimmedName = name.substring(0, 17)
  return trimmedName + Array(18 - trimmedName.length + 1).join(' ')
}

function getAmountAs11CharactersPaddedWithZeros (amount) {
  var padded = '00000000000' + amount
  return padded.substring(padded.length - 11)
}

function mkdirIfNotExists (dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }
}

function getFileName () {
  const datestamp = dateFormatter.now().format('YYYYMMDDHHmmss')
  return `apvs-payments-${datestamp}.txt`
}
