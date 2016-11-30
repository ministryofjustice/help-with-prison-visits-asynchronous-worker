const Promise = require('bluebird')
const expect = require('chai').expect
const deleteOldPaymentFiles = require('../../../../app/services/direct-payments/delete-old-payment-files')
const writeFile = Promise.promisify(require('fs').writeFile)
const fs = require('fs')

const TEST_FILE_PATH = 'test.csv'
const PAYMENT_FILE = { 'Filepath': TEST_FILE_PATH }

describe('services/direct-payments/delete-old-payment-files', function () {
  before(function () {
    writeFile(TEST_FILE_PATH, 'test file contents\n')
  })

  it('should delete test payment files', function (done) {
    deleteOldPaymentFiles([PAYMENT_FILE])
      .then(function () {
        fs.stat(TEST_FILE_PATH, function (err, stat) {
           // file should not exist
          expect(err.code).to.equal('ENOENT')
          expect(stat).to.be.undefined
          done()
        })
      })
  })
})
