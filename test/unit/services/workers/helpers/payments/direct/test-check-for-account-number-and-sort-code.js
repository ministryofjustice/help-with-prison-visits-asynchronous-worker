const checkForAccountNumberAndSortCode = require('../../../../../../../app/services/workers/helpers/payments/direct/check-for-account-number-and-sort-code')

const completePaymentData = [
  [116501, '026176', '73526253', 'David Green', '19.60', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [123456, '026176', '73526253', 'David Green', '45.90', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [997878, '026176', '73526253', 'David Green', '63.00', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [125787, '026176', '73526253', 'David Green', '5.91', 'FC5KW9Z', 'England', 'JA-2725BG.'],
]

const missingSortCode = [
  [116501, '026176', '73526253', 'David Green', '19.60', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [123456, '026176', '73526253', 'David Green', '45.90', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [997878, '', '73526253', 'David Green', '63.00', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [125787, '026176', '73526253', 'David Green', '5.91', 'FC5KW9Z', 'England', 'JA-2725BG.'],
]

const missingAccountNumber = [
  [116501, '026176', '73526253', 'David Green', '19.60', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [123456, '026176', '', 'David Green', '45.90', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [997878, '123556', '73526253', 'David Green', '63.00', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [125787, '026176', '73526253', 'David Green', '5.91', 'FC5KW9Z', 'England', 'JA-2725BG.'],
]

describe('services/workers/helpers/payments/direct/check-for-account-number-and-sort-code', function () {
  it(`should return ${false} when there is no missing data`, function () {
    const missingData = checkForAccountNumberAndSortCode(completePaymentData)
    expect(missingData).toEqual(false)
  })

  it(`should return ${true} when there is a missing sort code`, function () {
    const missingData = checkForAccountNumberAndSortCode(missingSortCode)
    expect(missingData).toEqual(true)
  })

  it(`should return ${true} when there is a missing account number`, function () {
    const missingData = checkForAccountNumberAndSortCode(missingAccountNumber)
    expect(missingData).toEqual(true)
  })
})
