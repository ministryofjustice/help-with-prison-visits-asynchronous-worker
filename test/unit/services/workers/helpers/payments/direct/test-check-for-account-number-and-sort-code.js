const expect = require('chai').expect

const checkForAccountNumberAndSortCode = require('../../../../../../../app/services/workers/helpers/payments/direct/check-for-account-number-and-sort-code')

var completePaymentData = [
  [116501, '026176', '73526253', 'David Green', '19.60', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [123456, '026176', '73526253', 'David Green', '45.90', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [997878, '026176', '73526253', 'David Green', '63.00', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [125787, '026176', '73526253', 'David Green', '5.91', 'FC5KW9Z', 'England', 'JA-2725BG.']
]

var missingSortCode = [
  [116501, '026176', '73526253', 'David Green', '19.60', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [123456, '026176', '73526253', 'David Green', '45.90', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [997878, '', '73526253', 'David Green', '63.00', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [125787, '026176', '73526253', 'David Green', '5.91', 'FC5KW9Z', 'England', 'JA-2725BG.']
]

var missingAccountNumber = [
  [116501, '026176', '73526253', 'David Green', '19.60', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [123456, '026176', '', 'David Green', '45.90', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [997878, '123556', '73526253', 'David Green', '63.00', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [125787, '026176', '73526253', 'David Green', '5.91', 'FC5KW9Z', 'England', 'JA-2725BG.']
]

describe('services/workers/helpers/payments/direct/check-for-account-number-and-sort-code', function () {
  it(`should return ${false} when there is no missing data`, function () {
    var missingData = checkForAccountNumberAndSortCode(completePaymentData)
    expect(missingData).to.eql(false)
  })

  it(`should return ${true} when there is a missing sort code`, function () {
    var missingData = checkForAccountNumberAndSortCode(missingSortCode)
    expect(missingData).to.eql(true)
  })

  it(`should return ${true} when there is a missing account number`, function () {
    var missingData = checkForAccountNumberAndSortCode(missingAccountNumber)
    expect(missingData).to.eql(true)
  })
})
