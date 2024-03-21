const fs = require('fs')
const util = require('util')
const unlink = util.promisify(require('fs').unlink)
const dateFormatter = require('../../../../app/services/date-formatter')
const config = require('../../../../config')
const XlsxPopulate = require('xlsx-populate')
const log = require('../../../../app/services/log')

const createAdiJournalFile = require('../../../../app/services/direct-payments/create-adi-journal-file')
let testFilePath

describe('services/direct-payments/create-adi-journal-file', function () {
  it('should generate ADI Journal file', function () {
    const accountingDate = dateFormatter.now().format('DD-MMM-YYYY')
    const amount = 123.45
    const journalName = config.ADI_JOURNAL_PREFIX + dateFormatter.now().format('DDMMYY') + config.ADI_JOURNAL_SUFFIX
    return createAdiJournalFile(amount)
      .then(function (filePath) {
        // file must have been created (cannot verify content)
        expect(fs.existsSync(filePath)).toBe(true) //eslint-disable-line
        testFilePath = filePath
        return XlsxPopulate.fromFileAsync(testFilePath)
          .then(workbook => {
            const adiJournalSheet = workbook.sheet(config.ADI_JOURNAL_SHEET)
            const totalCellValue = adiJournalSheet.cell(config.ADI_TOTAL_CELL).value()
            const debitCellValue = adiJournalSheet.cell(config.ADI_DEBIT_CELL).value()
            const accountingDateCellValue = adiJournalSheet.cell(config.ADI_ACCOUNTING_DATE_CELL).value()
            const periodCellValue = adiJournalSheet.cell(config.ADI_PERIOD_CELL).value()
            const adiJournalNameCellValue = adiJournalSheet.cell(config.ADI_JOURNAL_NAME_CELL).value()
            const adiJournalDescriptionCellValue = adiJournalSheet.cell(config.ADI_JOURNAL_DESCRIPTION_CELL).value()
            // 'Total Cell should have the value ' + amount
            expect(totalCellValue).toEqual(amount)
            // 'Debit Cell should have the value ' + amount
            expect(debitCellValue).toEqual(amount)
            // 'Accounting Date Cell should have the value ' + accountingDate
            expect(accountingDateCellValue).toEqual(accountingDate)
            // Period cell should be blank
            expect(periodCellValue).toBeUndefined()
            // 'Journal name cell should have the value ' + journalName
            expect(adiJournalNameCellValue).toEqual(journalName)
            // 'Journal description cell should have the value ' + journalName
            expect(adiJournalDescriptionCellValue).toEqual(journalName)
          })
          .catch(function (error) {
            log.error('An error occurred while reading the test journal ')
            log.error(error)
            throw (error)
          })
      })
  })

  afterAll(function () {
    console.log('\n\n\n\n\nTest File Path is ' + testFilePath + '\n\n\n\n\n\n')
    return unlink(testFilePath)
  })
})
