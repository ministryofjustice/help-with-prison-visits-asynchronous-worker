const util = require('util')
const deleteOldPaymentFiles = require('../../../../app/services/cleanup-old-data/delete-old-payment-files')
const writeFile = util.promisify(require('fs').writeFile)
const fs = require('fs')

const TEST_FILE_PATH = 'test.csv'
const PAYMENT_FILE = { Filepath: TEST_FILE_PATH }

describe('services/cleanup-old-data/delete-old-payment-files', function () {
  beforeAll(function () {
    return writeFile(TEST_FILE_PATH, 'test file contents\n')
  })

  it('should delete test payment files', function () {
    return deleteOldPaymentFiles([PAYMENT_FILE])
      .then(function () {
        expect(fs.existsSync(TEST_FILE_PATH)).toBe(false) //eslint-disable-line
      })
  })
})
