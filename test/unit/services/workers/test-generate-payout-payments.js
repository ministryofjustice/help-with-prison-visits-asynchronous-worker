const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')

const claimPaymentAmount1 = 45.50
const claimPaymentAmount2 = 22.22
const claimPaymentAmount3 = 13.99

const topUpPaymentAmount1 = 19.99
const topUpPaymentAmount2 = 20.01
const topUpPaymentAmount3 = 20.02
const dateOfVisit = '2017-09-28T00:00:00.000Z'

var claimsPendingPayment = [
  ['999997', claimPaymentAmount1.toString(), 'Alan', 'Turing', '123 Test Street', 'Test Town', 'Test County', 'Test Country', 'BT123BT', 'REF1234', dateOfVisit],
  ['999998', claimPaymentAmount2.toString(), 'Ada', 'Lovelace', '456 Test Street', 'Test Town2', 'Test County2', 'Test Country2', 'BT456BT', 'REF4567', dateOfVisit],
  ['999999', claimPaymentAmount3.toString(), 'Grace', 'Hopper', '789 Test Street', 'Test Town3', 'Test County3', 'Test Country3', 'BT789BT', 'REF8910', dateOfVisit]
]

var topUpsPendingPayment = [
  ['999990', topUpPaymentAmount1.toString(), 'Alan', 'Turing', '123 Test Street', 'Test Town', 'Test County', 'Test Country', 'BT123BT', 'REF1234'],
  ['999991', topUpPaymentAmount2.toString(), 'Ada', 'Lovelace', '456 Test Street', 'Test Town2', 'Test County2', 'Test Country2', 'BT456BT', 'REF4567'],
  ['999992', topUpPaymentAmount3.toString(), 'Grace', 'Hopper', '789 Test Street', 'Test Town3', 'Test County3', 'Test Country3', 'BT789BT', 'REF8910']
]

// var combinedPayments = [
//   ['999997', claimPaymentAmount1.toString(), 'Alan', 'Turing', '123 Test Street', 'Test Town', 'Test County', 'Test Country', 'BT123BT', 'REF1234'],
//   ['999998', claimPaymentAmount2.toString(), 'Ada', 'Lovelace', '456 Test Street', 'Test Town2', 'Test County2', 'Test Country2', 'BT456BT', 'REF4567'],
//   ['999999', claimPaymentAmount3.toString(), 'Grace', 'Hopper', '789 Test Street', 'Test Town3', 'Test County3', 'Test Country3', 'BT789BT', 'REF8910'],
//   ['999990', topUpPaymentAmount1.toString(), 'Alan', 'Turing', '123 Test Street', 'Test Town', 'Test County', 'Test Country', 'BT123BT', 'REF1234'],
//   ['999991', topUpPaymentAmount2.toString(), 'Ada', 'Lovelace', '456 Test Street', 'Test Town2', 'Test County2', 'Test Country2', 'BT456BT', 'REF4567'],
//   ['999992', topUpPaymentAmount3.toString(), 'Grace', 'Hopper', '789 Test Street', 'Test Town3', 'Test County3', 'Test Country3', 'BT789BT', 'REF8910']
// ]
var testPath = 'data/payments/test.csv'

var getClaimsPendingPayment = sinon.stub().resolves(claimsPendingPayment)
var getTopUpsPendingPayment = sinon.stub().resolves(topUpsPendingPayment)

var createPayoutFile = sinon.stub().resolves(testPath)
var sftpSendPayoutPaymentFile = sinon.stub().resolves()
var updateClaimsProcessedPaymentResult = sinon.stub().resolves()
var updateTopupsProcessedPaymentResult = sinon.stub().resolves()
var insertDirectBankPayments = sinon.stub().resolves()

const generateDirectPayments = proxyquire('../../../../app/services/workers/generate-payout-payments', {
  '../data/get-claims-pending-payment': getClaimsPendingPayment,
  '../data/get-topups-pending-payment': getTopUpsPendingPayment,
  '../payout-payments/create-payout-file': createPayoutFile,
  '../sftp/sftp-send-payout-payment-file': sftpSendPayoutPaymentFile,
  '../data/update-claims-processed-payment': updateClaimsProcessedPaymentResult,
  '../data/update-topups-processed-payment': updateTopupsProcessedPaymentResult,
  '../data/insert-direct-payment-file': insertDirectBankPayments
})

describe('services/workers/generate-payout-payments', function () {
  it('should retrieve claim data, format it, then call file generation', function () {
    return generateDirectPayments.execute({}).then(function () {
      expect(getClaimsPendingPayment.calledOnce).to.be.true
      expect(getTopUpsPendingPayment.calledOnce).to.be.true
      expect(createPayoutFile.calledWith(claimsPendingPayment)).to.be.true
      expect(sftpSendPayoutPaymentFile.calledWith(testPath, './test.csv')).to.be.true
      expect(updateClaimsProcessedPaymentResult.calledWith('999997', claimPaymentAmount1)).to.be.true
      expect(updateClaimsProcessedPaymentResult.calledWith('999998', claimPaymentAmount2)).to.be.true
      expect(updateClaimsProcessedPaymentResult.calledWith('999999', claimPaymentAmount3)).to.be.true
      expect(updateTopupsProcessedPaymentResult.calledWith('999990')).to.be.true
      expect(updateTopupsProcessedPaymentResult.calledWith('999991')).to.be.true
      expect(updateTopupsProcessedPaymentResult.calledWith('999992')).to.be.true
    })
  })
})
