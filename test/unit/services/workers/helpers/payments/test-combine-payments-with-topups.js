const expect = require('chai').expect

const combinePaymentWithTopups = require('../../../../../../app/services/workers/helpers/payments/combine-payments-with-topups')

var claims = [
  [116501, '026176', '73526253', 'David Green', '19.60', 'FC5KW9Z', 'England', 'JA-2725BG.']
]

var topups = [
  [116501, '026176', '73526253', 'David Green', '45.90', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [116501, '026176', '73526253', 'David Green', '63.00', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [116501, '026176', '73526253', 'David Green', '5.91', 'FC5KW9Z', 'England', 'JA-2725BG.']
]

var claimsAndTopups = [
  [116501, '026176', '73526253', 'David Green', '19.60', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [116501, '026176', '73526253', 'David Green', '45.90', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [116501, '026176', '73526253', 'David Green', '63.00', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [116501, '026176', '73526253', 'David Green', '5.91', 'FC5KW9Z', 'England', 'JA-2725BG.']
]

describe('services/workers/helpers/payments/combine-payments-with-topups', function () {
  it('should combine topup and claim payment data', function () {
    var combinedPayments = combinePaymentWithTopups(claims, topups)
    expect(combinedPayments).to.eql(claimsAndTopups)
  })
})
