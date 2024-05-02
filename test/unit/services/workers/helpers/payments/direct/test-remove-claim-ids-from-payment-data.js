const removeClaimIdsFromPaymetData = require('../../../../../../../app/services/workers/helpers/payments/direct/remove-claim-ids-from-payment-data')

const paymentData = [
  [116501, '026176', '73526253', 'David Green', '19.60', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [123456, '026176', '73526253', 'David Green', '45.90', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [997878, '026176', '73526253', 'David Green', '63.00', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [125787, '026176', '73526253', 'David Green', '5.91', 'FC5KW9Z', 'England', 'JA-2725BG.'],
]

const expectedPaymentDataWithoutClaimIds = [
  ['026176', '73526253', 'David Green', '19.60', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  ['026176', '73526253', 'David Green', '45.90', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  ['026176', '73526253', 'David Green', '63.00', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  ['026176', '73526253', 'David Green', '5.91', 'FC5KW9Z', 'England', 'JA-2725BG.'],
]

describe('services/workers/helpers/payments/direct/remove-claim-ids-from-payment-data', function () {
  it('should remove claimIds from payment data array', function () {
    const paymentDataWithoutClaimIds = removeClaimIdsFromPaymetData(paymentData, 0)
    expect(paymentDataWithoutClaimIds).toEqual(expectedPaymentDataWithoutClaimIds)
  })
})
