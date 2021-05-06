const Promise = require('bluebird')
const stringify = Promise.promisify(require('csv-stringify'))
const writeFile = Promise.promisify(require('fs').writeFile)
const fs = require('fs')
const path = require('path')
const dateFormatter = require('../date-formatter')
const config = require('../../../config')
const log = require('../log')
const AWS = require('aws-sdk')
const s3 = new AWS.S3({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY
})

module.exports = function (payments, isForApvu = false) {
  const filename = getFileName(isForApvu)
  const tempFilePath = path.join(config.FILE_TMP_DIR, filename)
  const data = formatPaymentsToCsvStandard(payments, isForApvu)

  const length = payments.length
  log.info(`Generating direct bank payments file with ${length} payments`)

  return stringify(data).then(function (content) {
    return writeFile(tempFilePath, content, {})
      .then(function () {
        log.info(`Filepath for direct payment file = ${tempFilePath}`)
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

function formatPaymentsToCsvStandard (payments, isForApvu = false) {
  const csvFormattedPayments = []

  let niTotal = 0
  let engTotal = 0
  let walTotal = 0
  let scoTotal = 0
  payments.forEach(function (payment) {
    const cost = parseFloat(payment[3])
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
    const thisPayment = [
      payment[0], // sortcode
      payment[1], // account number
      getNameAs18CharactersPaddedWithSpaces(payment[2]), // payee
      getAmountAs11CharactersPaddedWithZeros(payment[3]), // amount
      payment[6] // roll number
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

function getNameAs18CharactersPaddedWithSpaces (name) {
  const trimmedName = name.substring(0, 17)
  return trimmedName + Array(18 - trimmedName.length + 1).join(' ')
}

function getAmountAs11CharactersPaddedWithZeros (amount) {
  const padded = '00000000000' + amount
  return padded.substring(padded.length - 11)
}

function getFileName (isForApvu = false) {
  let filePrefix = 'apvs-payments'
  if (isForApvu) {
    filePrefix = 'apvu-' + filePrefix
  }
  const datestamp = dateFormatter.now().format('YYYYMMDDHHmmss')
  return `${filePrefix}-${datestamp}.txt`
}
