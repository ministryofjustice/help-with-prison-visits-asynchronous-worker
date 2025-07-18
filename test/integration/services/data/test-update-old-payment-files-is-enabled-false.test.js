const { getDatabaseConnector } = require('../../../../app/databaseConnector')
const dateFormatter = require('../../../../app/services/date-formatter')
const updateOldPaymentFilesIsEnabledFalse = require('../../../../app/services/data/update-old-payment-files-is-enabled-false')

describe('services/data/update-old-payment-files-is-enabled-false', () => {
  let paymentFileIds

  beforeAll(() => {
    const db = getDatabaseConnector()

    return db('IntSchema.DirectPaymentFile')
      .insert([
        {
          FileType: 'TEST_FILE',
          DateCreated: dateFormatter.now().toDate(),
          Filepath: 'test-file-path/testfile1.csv',
          IsEnabled: 'true',
        },
        {
          FileType: 'TEST_FILE',
          DateCreated: dateFormatter.now().toDate(),
          Filepath: 'test-file-path/testfile2.csv',
          IsEnabled: 'true',
        },
      ])
      .returning('PaymentFileId')
      .then(insertedIds => {
        paymentFileIds = insertedIds.map(paymentFile => paymentFile.PaymentFileId)
      })
  })

  it('should set IsEnabled to false for inserted payment files', () => {
    return updateOldPaymentFilesIsEnabledFalse(paymentFileIds).then(() => {
      const db = getDatabaseConnector()

      return db('IntSchema.DirectPaymentFile')
        .select('IsEnabled')
        .whereIn('PaymentFileId', paymentFileIds)
        .then(results => {
          expect(results[0].IsEnabled).toBe(false)
          expect(results[1].IsEnabled).toBe(false)
        })
    })
  })

  afterAll(() => {
    const db = getDatabaseConnector()

    return db('IntSchema.DirectPaymentFile').whereIn('PaymentFileId', paymentFileIds).del()
  })
})
