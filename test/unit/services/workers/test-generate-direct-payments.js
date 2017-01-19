const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')
const fileTypes = require('../../../../app/constants/payment-filetype-enum')

const claimPaymentAmount1 = 45.50
const claimPaymentAmount2 = 22.22
const claimPaymentAmount3 = 13.99

var claimsPendingPayment = [
  ['999997', '223344', '12345678', 'Alan Turing', claimPaymentAmount1.toString(), 'REF1234'],
  ['999998', '334455', '87654321', 'Ada Lovelace', claimPaymentAmount2.toString(), 'REF4567'],
  ['999999', '998877', '54321678', 'Grace Hopper', claimPaymentAmount3.toString(), 'REF9876']
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
      expect(updateClaimsProcessedPaymentResult.calledWith('999997', claimPaymentAmount1)).to.be.true
      expect(updateClaimsProcessedPaymentResult.calledWith('999998', claimPaymentAmount2)).to.be.true
      expect(updateClaimsProcessedPaymentResult.calledWith('999999', claimPaymentAmount3)).to.be.true
    })
  })
})
