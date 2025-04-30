const combinePaymentWithTopups = require('../../../../../../app/services/workers/helpers/payments/combine-payments-with-topups')

const claims = [[116501, '026176', '73526253', 'David Green', '19.60', 'FC5KW9Z', 'England', 'JA-2725BG.']]

const topups = [
  [116501, '026176', '73526253', 'David Green', '45.90', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [116501, '026176', '73526253', 'David Green', '63.00', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [116501, '026176', '73526253', 'David Green', '5.91', 'FC5KW9Z', 'England', 'JA-2725BG.'],
]

const claimsAndTopups = [
  [116501, '026176', '73526253', 'David Green', '19.60', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [116501, '026176', '73526253', 'David Green', '45.90', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [116501, '026176', '73526253', 'David Green', '63.00', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [116501, '026176', '73526253', 'David Green', '5.91', 'FC5KW9Z', 'England', 'JA-2725BG.'],
]

describe('services/workers/helpers/payments/combine-payments-with-topups', () => {
  it('should combine topup and claim payment data', () => {
    const combinedPayments = combinePaymentWithTopups(claims, topups)
    expect(combinedPayments).toEqual(claimsAndTopups)
  })
})
