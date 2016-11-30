const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')
const fileTypes = require('../../../../app/constants/payment-filetype-enum')

var claimsPendingPayment = [
  ['223344', '12345678', 'Alan Turing', '45.50', 'REF1234'],
  ['334455', '87654321', 'Ada Lovelace', '22.22', 'REF4567'],
  ['998877', '54321678', 'Grace Hopper', '13.99', 'REF9876']
]

var testPath = 'data/payments/test.csv'

var getClaimsPendingPayment = sinon.stub().resolves(claimsPendingPayment)
var createPaymentFile = sinon.stub().resolves(testPath)
var updateClaimsProcessedPaymentResult = sinon.stub().resolves()
var insertDirectBankPayments = sinon.stub().resolves()

const generateDirectPayments = proxyquire('../../../../app/services/workers/generate-direct-payments', {
  '../data/get-claims-pending-payment': getClaimsPendingPayment,
  '../direct-payments/create-payment-file': createPaymentFile,
  '../data/update-claims-processed-payment': updateClaimsProcessedPaymentResult,
  '../data/insert-direct-payment-file': insertDirectBankPayments
})

describe('services/workers/generate-direct-payments', function () {
  it('should retrieve claim data and then call file generation', function () {
    return generateDirectPayments.execute({}).then(function () {
      expect(getClaimsPendingPayment.calledOnce).to.be.true
      expect(createPaymentFile.calledWith(claimsPendingPayment)).to.be.true
      expect(insertDirectBankPayments.calledWith(testPath, fileTypes.ACCESSPAY_FILE)).to.be.true
      expect(updateClaimsProcessedPaymentResult.calledWith(['REF1234', 'REF4567', 'REF9876'])).to.be.true
    })
  })
})