const expect = require('chai').expect
const Promise = require('bluebird')
const fs = require('fs')
const unlink = Promise.promisify(require('fs').unlink)

const createAdiJournalFile = require('../../../../app/services/direct-payments/create-adi-journal-file')
var testFilePath

describe('services/direct-payments/create-adi-journal-file', function () {
  it('should generate ADI Journal file', function () {
    return createAdiJournalFile(123.45)
      .then(function (filePath) {
        expect(fs.existsSync(filePath), 'file must have been created (cannot verify content)').to.be.true
        testFilePath = filePath
      })
  })

  after(function () {
    return unlink(testFilePath)
  })
})
