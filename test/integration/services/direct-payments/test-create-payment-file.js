const expect = require('chai').expect
const Promise = require('bluebird')
const readFile = Promise.promisify(require('fs').readFile)
const unlink = Promise.promisify(require('fs').unlink)
const log = require('../../../../app/services/log')

const createPaymentFile = require('../../../../app/services/direct-payments/create-payment-file')
var testFilePath

const data = [
  ['223344', '11223344', 'Alan Turing', '22.33', 'REF1234H', 'England'],
  ['334455', '22334455', "John O'Shea", '10.00', 'REF4321H', 'Wales'],
  ['112233', '11223344', 'Joe Bloggs', '11.22', 'REF1000H', 'Northern Ireland'],
  ['445566', '77889900', 'James Brown', '10.22', 'REF1001H', 'Northern Ireland'],
  ['998877', '66554433', 'Mike Greene', '20.22', 'REF1002H', 'Northern Ireland'],
  ['221100', '22110022', 'Ryan Davidson', '15.51', 'REF1003H', 'England'],
  ['235689', '19241826', 'Jane Jackson', '11.22', 'REF1004H', 'Scotland'],
  ['330055', '19251814', 'Mike Browne', '10.22', 'REF1005H', 'Northern Ireland'],
  ['331155', '10234396', 'Alan Jones', '20.22', 'REF1006H', 'Northern Ireland'],
  ['338289', '03418438', "Terry O'Sullivan", '10.00', 'REF1007H', 'Scotland'],
  ['193262', '19261504', 'Johnny Black', '10.00', 'REF1008H', 'Wales']
]
// NI Total = 72.10
// Eng Total = 37.84
// Sco Total = 21.22
// Wales Total = 20.00
describe('services/direct-payments/create-payment-file', function () {
  it('should generate valid AccessPay file with correct header', function () {
    return createPaymentFile(data)
      .then(function (filePath) {
        expect(filePath).to.be.not.null
        testFilePath = filePath

        return readFile(filePath).then(function (content) {
          var lines = content.toString().split('\n')
          log.info(lines)
          expect(lines.length, '2 payment rows without header').to.be.equal(18)
          expect(lines[0]).to.be.equal('223344,11223344,Alan Turing       ,00000022.33,REF1234H,England')
          expect(lines[1]).to.be.equal("334455,22334455,John O'Shea       ,00000000010,REF4321H,Wales")
          expect(lines[13]).to.be.equal('England,37.84')
          expect(lines[14]).to.be.equal('Northern Ireland,72.10')
          expect(lines[15]).to.be.equal('Wales,20.00')
          expect(lines[16]).to.be.equal('Scotland,21.22')
        })
      })
  })

  after(function () {
    return unlink(testFilePath)
  })
})
