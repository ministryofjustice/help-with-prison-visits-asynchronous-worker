const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')

const claimPaymentAmount1 = 45.50
const claimPaymentAmount2 = 22.22
const claimPaymentAmount3 = 13.99

const topUpPaymentAmount1 = 19.99
const topUpPaymentAmount2 = 20.01
const topUpPaymentAmount3 = 20.02
const dateOfVisit = '2017-09-28T00:00:00.000Z'

const claimsPendingPayment = [
  ['999997', claimPaymentAmount1.toString(), 'Alan', 'Turing', '123 Test Street', 'Test Town', 'Test County', 'Test Country', 'BT123BT', 'REF1234', dateOfVisit],
  ['999998', claimPaymentAmount2.toString(), 'Ada', 'Lovelace', '456 Test Street', 'Test Town2', 'Test County2', 'Test Country2', 'BT456BT', 'REF4567', dateOfVisit],
  ['999999', claimPaymentAmount3.toString(), 'Grace', 'Hopper', '789 Test Street', 'Test Town3', 'Test County3', 'Test Country3', 'BT789BT', 'REF8910', dateOfVisit]
]

const topUpsPendingPayment = [
  ['999990', topUpPaymentAmount1.toString(), 'Alan', 'Turing', '123 Test Street', 'Test Town', 'Test County', 'Test Country', 'BT123BT', 'REF1234', dateOfVisit],
  ['999991', topUpPaymentAmount2.toString(), 'Ada', 'Lovelace', '456 Test Street', 'Test Town2', 'Test County2', 'Test Country2', 'BT456BT', 'REF4567', dateOfVisit],
  ['999992', topUpPaymentAmount3.toString(), 'Grace', 'Hopper', '789 Test Street', 'Test Town3', 'Test County3', 'Test Country3', 'BT789BT', 'REF8910', dateOfVisit]
]

const payments = [
  ['45.5', '', 'Alan', 'Turing', '123 Test Street', 'Test Town', 'Test County', 'Test Country', 'BT12 3BT', '2', '', '', 'REF1234', '', '', '', '', '', 'NOMS1086-LET-003', '', '', '28 09 2017'],
  ['22.22', '', 'Ada', 'Lovelace', '456 Test Street', 'Test Town2', 'Test County2', 'Test Country2', 'BT45 6BT', '2', '', '', 'REF4567', '', '', '', '', '', 'NOMS1086-LET-003', '', '', '28 09 2017'],
  ['13.99', '', 'Grace', 'Hopper', '789 Test Street', 'Test Town3', 'Test County3', 'Test Country3', 'BT78 9BT', '2', '', '', 'REF8910', '', '', '', '', '', 'NOMS1086-LET-003', '', '', '28 09 2017'],
  ['19.99', '', 'Alan', 'Turing', '123 Test Street', 'Test Town', 'Test County', 'Test Country', 'BT12 3BT', '2', '', '', 'REF1234', '', '', '', '', '', 'NOMS1086-LET-003', '', '', '28 09 2017'],
  ['20.01', '', 'Ada', 'Lovelace', '456 Test Street', 'Test Town2', 'Test County2', 'Test Country2', 'BT45 6BT', '2', '', '', 'REF4567', '', '', '', '', '', 'NOMS1086-LET-003', '', '', '28 09 2017'],
  ['20.02', '', 'Grace', 'Hopper', '789 Test Street', 'Test Town3', 'Test County3', 'Test Country3', 'BT78 9BT', '2', '', '', 'REF8910', '', '', '', '', '', 'NOMS1086-LET-003', '', '', '28 09 2017']
]
// var combinedPayments = [
//   ['999997', claimPaymentAmount1.toString(), 'Alan', 'Turing', '123 Test Street', 'Test Town', 'Test County', 'Test Country', 'BT123BT', 'REF1234'],
//   ['999998', claimPaymentAmount2.toString(), 'Ada', 'Lovelace', '456 Test Street', 'Test Town2', 'Test County2', 'Test Country2', 'BT456BT', 'REF4567'],
//   ['999999', claimPaymentAmount3.toString(), 'Grace', 'Hopper', '789 Test Street', 'Test Town3', 'Test County3', 'Test Country3', 'BT789BT', 'REF8910'],
//   ['999990', topUpPaymentAmount1.toString(), 'Alan', 'Turing', '123 Test Street', 'Test Town', 'Test County', 'Test Country', 'BT123BT', 'REF1234'],
//   ['999991', topUpPaymentAmount2.toString(), 'Ada', 'Lovelace', '456 Test Street', 'Test Town2', 'Test County2', 'Test Country2', 'BT456BT', 'REF4567'],
//   ['999992', topUpPaymentAmount3.toString(), 'Grace', 'Hopper', '789 Test Street', 'Test Town3', 'Test County3', 'Test Country3', 'BT789BT', 'REF8910']
// ]
const testPath = 'data/payments/test.csv'

const getClaimsPendingPayment = sinon.stub().resolves(claimsPendingPayment)
const getTopUpsPendingPayment = sinon.stub().resolves(topUpsPendingPayment)

const createPayoutFile = sinon.stub().resolves(testPath)
const sftpSendPayoutPaymentFile = sinon.stub().resolves()
const updateClaimsProcessedPaymentResult = sinon.stub().resolves()
const updateTopupsProcessedPaymentResult = sinon.stub().resolves()
const insertDirectBankPayments = sinon.stub().resolves()
const updateAllTopupsProcessedPayment = sinon.stub().resolves()
const updateAllClaimsProcessedPayment = sinon.stub().resolves()

const generateDirectPayments = proxyquire('../../../../app/services/workers/generate-payout-payments', {
  '../data/get-claims-pending-payment': getClaimsPendingPayment,
  '../data/get-topups-pending-payment': getTopUpsPendingPayment,
  '../payout-payments/create-payout-file': createPayoutFile,
  '../sftp/sftp-send-payout-payment-file': sftpSendPayoutPaymentFile,
  '../data/update-claims-processed-payment': updateClaimsProcessedPaymentResult,
  '../data/update-topups-processed-payment': updateTopupsProcessedPaymentResult,
  '../data/insert-direct-payment-file': insertDirectBankPayments,
  './helpers/payments/update-all-topups-processed-payment': updateAllTopupsProcessedPayment,
  './helpers/payments/update-all-claims-processed-payment': updateAllClaimsProcessedPayment
})

describe('services/workers/generate-payout-payments', function () {
  it('should retrieve claim data, format it, then call file generation', function () {
    return generateDirectPayments.execute({}).then(function () {
      expect(getClaimsPendingPayment.calledOnce).to.be.true //eslint-disable-line
      expect(getTopUpsPendingPayment.calledOnce).to.be.true //eslint-disable-line
      expect(createPayoutFile.calledWith(claimsPendingPayment)).to.be.true //eslint-disable-line
      expect(sftpSendPayoutPaymentFile.calledWith(testPath, './test.csv')).to.be.true //eslint-disable-line
      expect(updateAllClaimsProcessedPayment.calledWith(['999997', '999998', '999999'], payments, false)).to.be.true //eslint-disable-line
      expect(updateAllTopupsProcessedPayment.calledWith(['999990', '999991', '999992'])).to.be.true //eslint-disable-line
    })
  })
})
