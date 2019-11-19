const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-bluebird')
const fileTypes = require('../../../../app/constants/payment-filetype-enum')

const claimPaymentAmount1 = 45.50
const claimPaymentAmount2 = 22.22
const claimPaymentAmount3 = 13.99
const topUpPaymentAmount1 = 42.50
const topUpPaymentAmount2 = 20.22
const topUpPaymentAmount3 = 10.99
const total = '155.42'

var claimsPendingPayment = [
  ['999997', '223344', '12345678', 'Alan Turing', claimPaymentAmount1.toString(), 'REF1234'],
  ['999998', '334455', '87654321', 'Ada Lovelace', claimPaymentAmount2.toString(), 'REF4567'],
  ['999999', '998877', '54321678', 'Grace Hopper', claimPaymentAmount3.toString(), 'REF9876']
]
var topUpsPendingPayment = [
  ['999997', '223344', '12345678', 'Alan Turing', topUpPaymentAmount1.toString(), 'REF1234'],
  ['999998', '334455', '87654321', 'Ada Lovelace', topUpPaymentAmount2.toString(), 'REF4567'],
  ['999999', '998877', '54321678', 'Grace Hopper', topUpPaymentAmount3.toString(), 'REF9876']
]
var claimsMissingData = [['', '', '12345678', 'Alan Turing', claimPaymentAmount1.toString(), 'REF1234']]
var topUpMissingData = [['', '', '12345678', 'Alan Turing', topUpPaymentAmount1.toString(), 'REF1234']]

var testPath = 'data/payments/test.csv'
var testAdiPath = 'data/payments/adi.xlsm'

var generateDirectPayments
var getClaimsPendingPayment
var createPaymentFile
var createAdiJournalFile
var updateClaimsProcessedPaymentResult
var insertDirectBankPayments
var getTopUpsPendingPayment
var updateTopUpsPendingPayment

describe('services/workers/generate-direct-payments', function () {
  beforeEach(function () {
    getClaimsPendingPayment = sinon.stub()
    createPaymentFile = sinon.stub().resolves(testPath)
    createAdiJournalFile = sinon.stub().resolves(testAdiPath)
    updateClaimsProcessedPaymentResult = sinon.stub().resolves()
    insertDirectBankPayments = sinon.stub().resolves()
    getTopUpsPendingPayment = sinon.stub()
    updateTopUpsPendingPayment = sinon.stub().resolves()

    generateDirectPayments = proxyquire('../../../../app/services/workers/generate-direct-payments', {
      '../data/get-claims-pending-payment': getClaimsPendingPayment,
      '../direct-payments/create-payment-file': createPaymentFile,
      '../direct-payments/create-adi-journal-file': createAdiJournalFile,
      '../data/update-claims-processed-payment': updateClaimsProcessedPaymentResult,
      '../data/insert-direct-payment-file': insertDirectBankPayments,
      '../data/get-topups-pending-payment': getTopUpsPendingPayment,
      '../data/update-topups-processed-payment': updateTopUpsPendingPayment
    })
  })

  it('should retrieve claim data and then call file generation', function () {
    getClaimsPendingPayment.resolves(claimsPendingPayment)
    getTopUpsPendingPayment.resolves(topUpsPendingPayment)
    return generateDirectPayments.execute({}).then(function () {
      expect(getClaimsPendingPayment.calledOnce).to.be.true
      expect(createPaymentFile.calledWith(claimsPendingPayment)).to.be.true
      expect(createAdiJournalFile.calledWith(total)).to.be.true
      expect(insertDirectBankPayments.calledWith(testPath, fileTypes.ACCESSPAY_FILE)).to.be.true
      expect(insertDirectBankPayments.calledWith(testAdiPath, fileTypes.ADI_JOURNAL_FILE)).to.be.true
      expect(updateClaimsProcessedPaymentResult.calledWith('999997', claimPaymentAmount1)).to.be.true
      expect(updateClaimsProcessedPaymentResult.calledWith('999998', claimPaymentAmount2)).to.be.true
      expect(updateClaimsProcessedPaymentResult.calledWith('999999', claimPaymentAmount3)).to.be.true
    })
  })

  it('should find no data and not call file generation', function () {
    getClaimsPendingPayment.resolves(claimsMissingData)
    getTopUpsPendingPayment.resolves(topUpMissingData)
    return generateDirectPayments.execute({}).then(function () {
      expect(getClaimsPendingPayment.calledOnce).to.be.true
      expect(createPaymentFile.calledWith(claimsPendingPayment)).to.be.false
    })
      .catch(function (error) {
        expect(error).to.equal('Data is missing')
      })
  })

  it('should find missing top up data and valid claim data and not call file generation', function () {
    getClaimsPendingPayment.resolves(claimsPendingPayment)
    getTopUpsPendingPayment.resolves(topUpMissingData)
    return generateDirectPayments.execute({}).then(function () {
      expect(getClaimsPendingPayment.calledOnce).to.be.true
      expect(createPaymentFile.calledWith(claimsPendingPayment)).to.be.false
    })
      .catch(function (error) {
        console.log(error)
        expect(error).to.equal('Data is missing')
      })
  })
})
