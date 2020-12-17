const expect = require('chai').expect

const formatCSVData = require('../../../../../../../app/services/workers/helpers/payments/payout/format-csv-data')

const paymentData = [
  [116827, '294.55', 'test', 'test', '1 Main london', 'lonon', 'london', 'England', 'SW195AE', 'S0A320S', '2020-03-22T00:00:00.000Z'],
  [116827, '20.21', 'test', 'test', '1 Main london', 'lonon', 'london', 'England', 'SW195AE', 'S0A320S', '2020-03-22T00:00:00.000Z'],
  [116827, '10.93', 'test', 'test', '1 Main london', 'lonon', 'london', 'England', 'SW195AE', 'S0A320S', '2020-03-22T00:00:00.000Z']
]

const expectedCSVData = [
  ['294.55', '', 'test', 'test', '1 Main london', 'lonon', 'london', 'England', 'SW19 5AE', '2', '', '', 'S0A320S', '', '', '', '', '', 'NOMS1086-LET-003', '', '', '22 03 2020'],
  ['20.21', '', 'test', 'test', '1 Main london', 'lonon', 'london', 'England', 'SW19 5AE', '2', '', '', 'S0A320S', '', '', '', '', '', 'NOMS1086-LET-003', '', '', '22 03 2020'],
  ['10.93', '', 'test', 'test', '1 Main london', 'lonon', 'london', 'England', 'SW19 5AE', '2', '', '', 'S0A320S', '', '', '', '', '', 'NOMS1086-LET-003', '', '', '22 03 2020']
]

describe('services/workers/helpers/payments/payout/format-csv-data', function () {
  it('should format voucher CSV data correctly', function () {
    const csvData = formatCSVData(paymentData, 0)
    expect(csvData).to.eql(expectedCSVData)
  })
})
