const expect = require('chai').expect
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
        expect(fs.existsSync(filePath), 'file must have been created (cannot verify content)').to.be.true //eslint-disable-line
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
            expect(totalCellValue, 'Total Cell should have the value ' + amount).to.be.eql(amount)
            expect(debitCellValue, 'Debit Cell should have the value ' + amount).to.be.eql(amount)
            expect(accountingDateCellValue, 'Accounting Date Cell should have the value ' + accountingDate).to.be.eql(accountingDate)
            expect(periodCellValue, 'Period cell should be blank').to.be.eql(undefined)
            expect(adiJournalNameCellValue, 'Journal name cell should have the value ' + journalName).to.be.eql(journalName)
            expect(adiJournalDescriptionCellValue, 'Journal description cell should have the value ' + journalName).to.be.eql(journalName)
          })
          .catch(function (error) {
            log.error('An error occurred while reading the test journal ')
            log.error(error)
            throw (error)
          })
      })
  })

  after(function () {
    console.log('\n\n\n\n\nTest File Path is ' + testFilePath + '\n\n\n\n\n\n')
    return unlink(testFilePath)
  })
})
