const util = require('util')
const writeFile = util.promisify(require('fs').writeFile)
const fs = require('fs')
const deleteOldPaymentFiles = require('../../../../app/services/cleanup-old-data/delete-old-payment-files')

const TEST_FILE_PATH = 'test.csv'
const PAYMENT_FILE = { Filepath: TEST_FILE_PATH }

describe('services/cleanup-old-data/delete-old-payment-files', () => {
  beforeAll(() => {
    return writeFile(TEST_FILE_PATH, 'test file contents\n')
  })

  it('should delete test payment files', () => {
    return deleteOldPaymentFiles([PAYMENT_FILE]).then(() => {
      expect(fs.existsSync(TEST_FILE_PATH)).toBe(false)
    })
  })
})
