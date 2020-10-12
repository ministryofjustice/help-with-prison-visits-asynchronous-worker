const XlsxPopulate = require('xlsx-populate')
const config = require('../../../config')
const log = require('../log')
const dateFormatter = require('../date-formatter')
const path = require('path')

module.exports = function (totalPayment) {
  const dataPath = config.DATA_FILE_PATH
  const outputPath = path.join(dataPath, config.PAYMENT_FILE_PATH)

  var fullOutputFilePath = path.join(outputPath, getFileName())

  var accountingDate = dateFormatter.now().format('DD MMM YYYY')
  var journalName = config.ADI_JORNAL_PREFIX + dateFormatter.now().format('DDMMYY') + config.ADI_JORNAL_SUFFIX
  return XlsxPopulate.fromFileAsync(config.ADI_TEMPLATE_PATH)
    .then(workbook => {
      // Update the two template rows to debit/credit the total amount
      var adiJournalSheet = workbook.sheet(config.ADI_JOURNAL_SHEET)
      adiJournalSheet.cell(config.ADI_TOTAL_CELL).value(Number(totalPayment))
      adiJournalSheet.cell(config.ADI_DEBIT_CELL).value(Number(totalPayment))
      adiJournalSheet.cell(config.ADI_ACCOUNTING_DATE_CELL).value(accountingDate)
      adiJournalSheet.cell(config.ADI_PERIOD_CELL).value('')
      adiJournalSheet.cell(config.ADI_JORNAL_NAME_CELL).value(journalName)
      // Modify the workbook
      return workbook.toFileAsync(fullOutputFilePath)
        .then(function () {
          return fullOutputFilePath
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
