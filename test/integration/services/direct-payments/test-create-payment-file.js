const util = require('util')
const readFile = util.promisify(require('fs').readFile)
const unlink = util.promisify(require('fs').unlink)

const createPaymentFile = require('../../../../app/services/direct-payments/create-payment-file')

let testFilePath

const data = [
  ['223344', '11223344', 'Alan Turing', '22.33', 'REF1234H', 'England', ''],
  ['334455', '22334455', "John O'Shea", '10.00', 'REF4321H', 'Wales', ''],
  ['112233', '11223344', 'Joe Bloggs', '11.22', 'REF1000H', 'Northern Ireland', ''],
  ['445566', '77889900', 'James Brown', '10.22', 'REF1001H', 'Northern Ireland', ''],
  ['998877', '66554433', 'Mike Greene', '20.22', 'REF1002H', 'Northern Ireland', ''],
  ['221100', '22110022', 'Ryan Davidson', '15.51', 'REF1003H', 'England', ''],
  ['235689', '19241826', 'Jane Jackson', '11.22', 'REF1004H', 'Scotland', ''],
  ['330055', '19251814', 'Mike Browne', '10.22', 'REF1005H', 'Northern Ireland', ''],
  ['331155', '10234396', 'Alan Jones', '20.22', 'REF1006H', 'Northern Ireland', ''],
  ['338289', '03418438', "Terry O'Sullivan", '10.00', 'REF1007H', 'Scotland', 'ROLL-1BE.R'],
  ['193262', '19261504', 'Johnny Black', '10.00', 'REF1008H', 'Wales', ''],
]
// NI Total = 72.10
// Eng Total = 37.84
// Sco Total = 21.22
// Wales Total = 20.00
describe('services/direct-payments/create-payment-file', function () {
  it('should generate valid APVU AccessPay file with correct header', function () {
    return createPaymentFile(data, true).then(function (filePath) {
      expect(filePath).not.toBeNull()
      testFilePath = filePath

      return readFile(filePath).then(function (content) {
        const lines = content.toString().split('\n')
        // 2 payment rows without header
        expect(lines.length).toBe(18)
        expect(lines[0]).toBe('223344,11223344,Alan Turing       ,00000022.33,,REF1234H,England')
        expect(lines[1]).toBe("334455,22334455,John O'Shea       ,00000010.00,,REF4321H,Wales")
        expect(lines[9]).toBe("338289,03418438,Terry O'Sullivan  ,00000010.00,ROLL-1BE.R,REF1007H,Scotland")
        expect(lines[13]).toBe('England,37.84')
        expect(lines[14]).toBe('Northern Ireland,72.10')
        expect(lines[15]).toBe('Wales,20.00')
        expect(lines[16]).toBe('Scotland,21.22')
      })
    })
  })

  it('should generate valid SSCL AccessPay file with correct header', function () {
    return createPaymentFile(data, false).then(function (filePath) {
      expect(filePath).not.toBeNull()
      testFilePath = filePath

      return readFile(filePath).then(function (content) {
        const lines = content.toString().split('\n')
        // 2 payment rows without header
        expect(lines.length).toBe(12)
        expect(lines[0]).toBe('223344,11223344,Alan Turing       ,00000022.33,')
        expect(lines[1]).toBe("334455,22334455,John O'Shea       ,00000010.00,")
        expect(lines[9]).toBe("338289,03418438,Terry O'Sullivan  ,00000010.00,ROLL-1BE.R")
      })
    })
  })

  afterAll(function () {
    return unlink(testFilePath)
  })
})
