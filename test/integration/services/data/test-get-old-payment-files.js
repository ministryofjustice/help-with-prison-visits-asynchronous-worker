const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const { getOldPaymentFiles } = require('../../../../app/services/data/get-old-payment-files')
const dateFormatter = require('../../../../app/services/date-formatter')

const OLD_FILE_DATE = dateFormatter.now().subtract('40', 'days')

describe('services/data/get-old-payment-files', function () {
  let paymentFileIds

  beforeAll(function () {
    const db = getDatabaseConnector()

    return db('IntSchema.DirectPaymentFile')
      .insert([
        {
          FileType: 'TEST_FILE',
          DateCreated: OLD_FILE_DATE.toDate(),
          Filepath: 'test-file-path/testfile1.csv',
          IsEnabled: 'true',
        },
        {
          FileType: 'TEST_FILE',
          DateCreated: OLD_FILE_DATE.toDate(),
          Filepath: 'test-file-path/testfile2.csv',
          IsEnabled: 'true',
        },
      ])
      .returning('PaymentFileId')
      .then(function (insertedIds) {
        paymentFileIds = insertedIds.map(paymentFile => paymentFile.PaymentFileId)
      })
  })

  it('should retrieve inserted payment files', function () {
    return getOldPaymentFiles().then(function (results) {
      // Find files that were inserted
      const testFiles = results.filter(function (result) {
        return paymentFileIds.indexOf(result.PaymentFileId) !== -1
      })

      expect(testFiles.length).toBe(2)
    })
  })

  afterAll(function () {
    const db = getDatabaseConnector()

    return db('IntSchema.DirectPaymentFile').whereIn('PaymentFileId', paymentFileIds).del()
  })
})
