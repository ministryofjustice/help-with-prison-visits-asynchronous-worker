const expect = require('chai').expect

const getTotalFromPaymentData = require('../../../../../../../app/services/workers/helpers/payments/direct/get-total-from-payment-data')

var paymentData = [
  ['026176', '73526253', 'David Green', '19.60', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  ['026176', '73526253', 'David Green', '45.90', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  ['026176', '73526253', 'David Green', '63.00', 'FC5KW9Z', 'England', 'JA-2725BG.'],
  ['026176', '73526253', 'David Green', '5.91', 'FC5KW9Z', 'England', 'JA-2725BG.']
]

var expectedTotal = '134.41'

describe('services/workers/helpers/payments/direct/get-total-from-payment-data', function () {
  it('should return the correct direct payment total of all claims', function () {
    var total = getTotalFromPaymentData(paymentData)
    expect(total).to.eql(expectedTotal)
  })

  it('should return the correct direct payment total when paymentData contains only 1 item', function () {
    paymentData = paymentData.splice(0, 1)
    expectedTotal = paymentData[0][3]
    var total = getTotalFromPaymentData(paymentData)
    expect(total).to.eql(expectedTotal)
  })
})
