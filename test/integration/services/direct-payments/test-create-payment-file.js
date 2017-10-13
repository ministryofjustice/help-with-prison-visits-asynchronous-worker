/*  const expect = require('chai').expect
const Promise = require('bluebird')
const readFile = Promise.promisify(require('fs').readFile)
const unlink = Promise.promisify(require('fs').unlink)

const createPaymentFile = require('../../../../app/services/direct-payments/create-payment-file')
var testFilePath

const data = [
  ['223344', '11223344', 'Alan Turing', '22.33', 'REF1234H'],
  ['334455', '22334455', "John O'Shea", '11.22', 'REF4321H']
]

describe('services/direct-payments/create-payment-file', function () {
  it('should generate valid AccessPay file with correct header', function () {
    return createPaymentFile(data)
      .then(function (filePath) {
        expect(filePath).to.be.not.null
        testFilePath = filePath

        return readFile(filePath).then(function (content) {
          var lines = content.toString().split('\n')
          expect(lines.length, '2 payment rows without header').to.be.equal(3)
          expect(lines[0]).to.be.equal('223344,11223344,Alan Turing       ,00000022.33,REF1234H')
          expect(lines[1]).to.be.equal("334455,22334455,John O'Shea       ,00000011.22,REF4321H")
        })
      })
  })

  after(function () {
    return unlink(testFilePath)
  })
})  */
