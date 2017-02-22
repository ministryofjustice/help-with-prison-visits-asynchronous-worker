const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const claimPaymentAmount1 = 45.50
const claimPaymentAmount2 = 22.22
const claimPaymentAmount3 = 13.99

var claimsPendingPayment = [
  ['999997', claimPaymentAmount1.toString(), 'Alan', 'Turing', '123 Test Street', 'Test Town', 'Test County', 'Test Country', 'BT123BT', 'REF1234'],
  ['999998', claimPaymentAmount2.toString(), 'Ada', 'Lovelace', '456 Test Street', 'Test Town2', 'Test County2', 'Test Country2', 'BT456BT', 'REF4567'],
  ['999999', claimPaymentAmount3.toString(), 'Grace', 'Hopper', '789 Test Street', 'Test Town3', 'Test County3', 'Test Country3', 'BT789BT', 'REF8910']
]

var testPath = 'data/payments/test.csv'

var getClaimsPendingPayment = sinon.stub().resolves(claimsPendingPayment)
var createPayoutFile = sinon.stub().resolves(testPath)
var updateClaimsProcessedPaymentResult = sinon.stub().resolves()
var insertPayoutPayments = sinon.stub().resolves()

const generateDirectPayments = proxyquire('../../../../app/services/workers/generate-payout-payments', {
  '../data/get-claims-pending-payment': getClaimsPendingPayment,
  '../payout-payments/create-payout-file': createPayoutFile,
  '../data/update-claims-processed-payment': updateClaimsProcessedPaymentResult,
  '../data/insert-direct-payment-file': insertPayoutPayments
})

describe('services/workers/generate-payout-payments', function () {
  it('should retrieve claim data, format it, then call file generation', function () {
    return generateDirectPayments.execute({}).then(function () {
      expect(getClaimsPendingPayment.calledOnce).to.be.true
      expect(createPayoutFile.calledWith(claimsPendingPayment)).to.be.true
      expect(updateClaimsProcessedPaymentResult.calledWith('999997', claimPaymentAmount1)).to.be.true
      expect(updateClaimsProcessedPaymentResult.calledWith('999998', claimPaymentAmount2)).to.be.true
      expect(updateClaimsProcessedPaymentResult.calledWith('999999', claimPaymentAmount3)).to.be.true
    })
  })
})
