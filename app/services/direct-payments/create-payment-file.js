const util = require('util')
const { stringify } = require('csv-stringify')

const generateCsvString = util.promisify(stringify)
const writeFile = util.promisify(require('fs').writeFile)
const path = require('path')
const dateFormatter = require('../date-formatter')
const config = require('../../../config')
const log = require('../log')
const { AWSHelper } = require('../aws-helper')

const aws = new AWSHelper()

module.exports = (payments, isForApvu = false) => {
  const filename = getFileName(isForApvu)
  const tempFilePath = path.join(config.FILE_TMP_DIR, filename)
  const data = formatPaymentsToCsvStandard(payments, isForApvu)

  const { length } = payments
  log.info(`Generating direct bank payments file with ${length} payments`)

  return generateCsvString(data).then(content => {
    return writeFile(tempFilePath, content, {}).then(async () => {
      log.info(`Filepath for direct payment file = ${tempFilePath}`)
      return aws.upload(filename, tempFilePath)
    })
  })
}

function formatPaymentsToCsvStandard(payments, isForApvu = false) {
  const csvFormattedPayments = []

  let niTotal = 0
  let engTotal = 0
  let walTotal = 0
  let scoTotal = 0
  payments.forEach(payment => {
    const cost = parseFloat(payment[3])
    switch (payment[5]) {
      case 'England':
        engTotal += cost
        break
      case 'Northern Ireland':
        niTotal += cost
        break
      case 'Scotland':
        scoTotal += cost
        break
      case 'Wales':
        walTotal += cost
        break
      default:
    }
    const thisPayment = [
      payment[0], // sortcode
      payment[1], // account number
      getNameAs18CharactersPaddedWithSpaces(payment[2]), // payee
      getAmountAs11CharactersPaddedWithZeros(payment[3]), // amount
      payment[6], // roll number
    ]
    if (isForApvu) {
      // reference
      thisPayment.push(payment[4])
      // country
      thisPayment.push(payment[5])
    }
    csvFormattedPayments.push(thisPayment)
  })
  if (isForApvu) {
    csvFormattedPayments.push([])
    csvFormattedPayments.push(['Country', 'Total Amount'])
    csvFormattedPayments.push(['England', engTotal.toFixed(2)])
    csvFormattedPayments.push(['Northern Ireland', niTotal.toFixed(2)])
    csvFormattedPayments.push(['Wales', walTotal.toFixed(2)])
    csvFormattedPayments.push(['Scotland', scoTotal.toFixed(2)])
  }

  return csvFormattedPayments
}

function getNameAs18CharactersPaddedWithSpaces(name) {
  const trimmedName = name.substring(0, 17)
  return trimmedName + Array(18 - trimmedName.length + 1).join(' ')
}

function getAmountAs11CharactersPaddedWithZeros(amount) {
  const padded = `00000000000${amount}`
  return padded.substring(padded.length - 11)
}

function getFileName(isForApvu = false) {
  const filePrefix = isForApvu ? 'apvu-apvs-payments' : 'apvs-payments'
  const datestamp = dateFormatter.now().format('YYYYMMDDHHmmss')
  return `${filePrefix}-${datestamp}.txt`
}
