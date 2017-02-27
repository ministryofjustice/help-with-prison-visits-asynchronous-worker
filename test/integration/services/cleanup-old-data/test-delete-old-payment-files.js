const Promise = require('bluebird')
const expect = require('chai').expect
const deleteOldPaymentFiles = require('../../../../app/services/cleanup-old-data/delete-old-payment-files')
const writeFile = Promise.promisify(require('fs').writeFile)
const fs = require('fs')

const TEST_FILE_PATH = 'test.csv'
const PAYMENT_FILE = { 'Filepath': TEST_FILE_PATH }

describe('services/cleanup-old-data/delete-old-payment-files', function () {
  before(function () {
    return writeFile(TEST_FILE_PATH, 'test file contents\n')
  })

  it('should delete test payment files', function () {
    return deleteOldPaymentFiles([PAYMENT_FILE])
      .then(function () {
        expect(fs.existsSync(TEST_FILE_PATH)).to.be.false
      })
  })
})
