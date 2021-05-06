const XlsxPopulate = require('xlsx-populate')
const config = require('../../../config')
const log = require('../log')
const dateFormatter = require('../date-formatter')
const fs = require('fs')
const path = require('path')
const AWS = require('aws-sdk')
const s3 = new AWS.S3({
  accessKeyId: config.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AWS_SECRET_ACCESS_KEY
})

module.exports = function (totalPayment) {
  const filename = getFileName()
  const fullOutputFilePath = path.join(config.FILE_TMP_DIR, filename)

  const accountingDate = dateFormatter.now().format('DD-MMM-YYYY')
  const journalName = config.ADI_JOURNAL_PREFIX + dateFormatter.now().format('DDMMYY') + config.ADI_JOURNAL_SUFFIX
  return XlsxPopulate.fromFileAsync(config.ADI_TEMPLATE_PATH)
    .then(workbook => {
      // Update the two template rows to debit/credit the total amount
      const adiJournalSheet = workbook.sheet(config.ADI_JOURNAL_SHEET)
      adiJournalSheet.cell(config.ADI_TOTAL_CELL).value(Number(totalPayment))
      adiJournalSheet.cell(config.ADI_DEBIT_CELL).value(Number(totalPayment))
      adiJournalSheet.cell(config.ADI_ACCOUNTING_DATE_CELL).value(accountingDate)
      adiJournalSheet.cell(config.ADI_PERIOD_CELL).value('')
      adiJournalSheet.cell(config.ADI_JOURNAL_NAME_CELL).value(journalName)
      adiJournalSheet.cell(config.ADI_JOURNAL_DESCRIPTION_CELL).value(journalName)
      // Modify the workbook
      return workbook.toFileAsync(fullOutputFilePath)
        .then(function () {
          const uploadParams = {
            Bucket: config.AWS_S3_BUCKET_NAME,
            Key: filename,
            Body: ''
          }

          const fileStream = fs.createReadStream(fullOutputFilePath)
            .on('error', function (error) {
              log.error('Error occurred reading from file ' + fullOutputFilePath)
              throw new Error(error)
            })

          uploadParams.Body = fileStream

          s3.upload(uploadParams, function (err, data) {
            if (err) {
              log.error('Error', err)
            } if (data) {
              log.info('Upload Success', data.Location)
              return filename
            }
          })
        })
        .catch(function (error) {
          log.error('An error occurred while writing the ADI journal to', fullOutputFilePath)
          log.error(error)
          throw (error)
        })
    })
    .catch(function (error) {
      log.error('An error occurred while reading the ADI journal template')
      log.error(error)
      throw (error)
    })
}

function getFileName () {
  const datestamp = dateFormatter.now().format('YYYYMMDDHHmmss')
  return `apvs-adi-journal-${datestamp}.xlsm`
}
