const config = require('../../../../knexfile').asyncworker
const knex = require('knex')(config)
const expect = require('chai').expect
const dateFormatter = require('../../../../app/services/date-formatter')
const updateOldPaymentFilesIsEnabledFalse = require('../../../../app/services/data/update-old-payment-files-is-enabled-false')

describe('services/data/update-old-payment-files-is-enabled-false', function () {
  let paymentFileIds

  before(function () {
    return knex('IntSchema.DirectPaymentFile')
      .insert([
        {
          FileType: 'TEST_FILE',
          DateCreated: dateFormatter.now().toDate(),
          Filepath: 'test-file-path/testfile1.csv',
          IsEnabled: 'true'
        },
        {
          FileType: 'TEST_FILE',
          DateCreated: dateFormatter.now().toDate(),
          Filepath: 'test-file-path/testfile2.csv',
          IsEnabled: 'true'
        }
      ])
      .returning('PaymentFileId')
      .then(function (insertedIds) {
        paymentFileIds = insertedIds
      })
  })

  it('should set IsEnabled to false for inserted payment files', function () {
    return updateOldPaymentFilesIsEnabledFalse(paymentFileIds)
      .then(function () {
        return knex('IntSchema.DirectPaymentFile')
          .select('IsEnabled')
          .whereIn('PaymentFileId', paymentFileIds)
          .then(function (results) {
            expect(results[0].IsEnabled).to.equal(false)
            expect(results[1].IsEnabled).to.equal(false)
          })
      })
  })

  after(function () {
    return knex('IntSchema.DirectPaymentFile')
      .whereIn('PaymentFileId', paymentFileIds).del()
  })
})
