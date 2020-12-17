const expect = require('chai').expect

const getClaimIdsFromPaymentData = require('../../../../../../app/services/workers/helpers/payments/get-claim-ids-from-payment-data')

const paymentData = [
  [116501, '026176', '73526253', 'David Green', '19.60', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [123456, '026176', '73526253', 'David Green', '45.90', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [997878, '026176', '73526253', 'David Green', '63.00', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  [125787, '026176', '73526253', 'David Green', '5.91', 'FC5KW9Z', 'England', 'JA-2725BG.']
]

const expectedClaimIds = [
  116501, 123456, 997878, 125787
]

describe('services/workers/helpers/payments/get-claim-ids-from-payment-data', function () {
  it('should return a 1-dimensional array of claim Ids', function () {
    const claimIds = getClaimIdsFromPaymentData(paymentData, 0)
    expect(claimIds).to.eql(expectedClaimIds)
  })
})
