const expect = require('chai').expect
const Promise = require('bluebird')
const readFile = Promise.promisify(require('fs').readFile)
const unlink = Promise.promisify(require('fs').unlink)

const createPaymentFile = require('../../../../app/services/payout-payments/create-payout-file')
var testFilePath

const data = [
  ['34.22', 'Joe', 'Bloggs', '123 Test Street', 'Test Town', 'Test County', 'Test Country', 'BT123BT', '3', '', '', 'V123456', '', '', '', '', '', 'TEST089-LET-001'],
  ['12.22', 'Frank', 'Bloggs', '456 Test Street', 'Test Town', 'Test County', 'Test Country', 'BT126BT', '3', '', '', 'V123457', '', '', '', '', '', 'TEST089-LET-001']
]

describe('services/payout-payments/create-payout-file', function () {
  it('should generate valid file', function () {
    return createPaymentFile(data)
      .then(function (filePath) {
        expect(filePath).to.be.not.null
        testFilePath = filePath

        readFile(filePath).then(function (content) {
          var lines = content.toString().split('\n')
          expect(lines.length).to.be.equal(3)
          expect(lines[0]).to.be.equal('34.22,Joe,Bloggs,123 Test Street,Test Town,Test County,Test Country,BT123BT,3,,,V123456,,,,,,TEST089-LET-001')
          expect(lines[1]).to.be.equal('12.22,Frank,Bloggs,456 Test Street,Test Town,Test County,Test Country,BT126BT,3,,,V123457,,,,,,TEST089-LET-001')
        })
      })
  })

  after(function () {
    return unlink(testFilePath)
  })
})
