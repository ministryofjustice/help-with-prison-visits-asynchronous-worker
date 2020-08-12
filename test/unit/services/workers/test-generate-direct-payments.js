const expect = require('chai').expect
const proxyquire = require('proxyquire')
const sinon = require('sinon')

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
  ['123456', '223344', '12345678', 'Alan Turing', topUpPaymentAmount1.toString(), 'REF1234'],
  ['123457', '334455', '87654321', 'Ada Lovelace', topUpPaymentAmount2.toString(), 'REF4567'],
  ['123458', '998877', '54321678', 'Grace Hopper', topUpPaymentAmount3.toString(), 'REF9876']
]

var payments = [
  ['223344', '12345678', 'Alan Turing', '45.5', 'REF1234'],
  ['334455', '87654321', 'Ada Lovelace', '22.22', 'REF4567'],
  ['998877', '54321678', 'Grace Hopper', '13.99', 'REF9876'],
  ['223344', '12345678', 'Alan Turing', '42.5', 'REF1234'],
  ['334455', '87654321', 'Ada Lovelace', '20.22', 'REF4567'],
  ['998877', '54321678', 'Grace Hopper', '10.99', 'REF9876']
]

var claimsMissingData = [['', '', '12345678', 'Alan Turing', claimPaymentAmount1.toString(), 'REF1234']]
var topUpMissingData = [['', '', '12345678', 'Alan Turing', topUpPaymentAmount1.toString(), 'REF1234']]

var testPath = 'data/payments/test.csv'
var testAdiPath = 'data/payments/adi.xlsm'

var generateDirectPayments
var getClaimsPendingPayment
var createPaymentFile
var createAdiJournalFile
var insertDirectBankPayments
var getTopUpsPendingPayment
var updateAllTopupsProcessedPayment
var updateAllClaimsProcessedPayment

describe('services/workers/generate-direct-payments', function () {
  beforeEach(function () {
    getClaimsPendingPayment = sinon.stub()
    createPaymentFile = sinon.stub().resolves(testPath)
    createAdiJournalFile = sinon.stub().resolves(testAdiPath)
    insertDirectBankPayments = sinon.stub().resolves()
    getTopUpsPendingPayment = sinon.stub()
    updateAllTopupsProcessedPayment = sinon.stub().resolves()
    updateAllClaimsProcessedPayment = sinon.stub().resolves()

    generateDirectPayments = proxyquire('../../../../app/services/workers/generate-direct-payments', {
      '../data/get-claims-pending-payment': getClaimsPendingPayment,
      '../direct-payments/create-payment-file': createPaymentFile,
      '../direct-payments/create-adi-journal-file': createAdiJournalFile,
      '../data/insert-direct-payment-file': insertDirectBankPayments,
      '../data/get-topups-pending-payment': getTopUpsPendingPayment,
      './helpers/payments/update-all-topups-processed-payment': updateAllTopupsProcessedPayment,
      './helpers/payments/update-all-claims-processed-payment': updateAllClaimsProcessedPayment
    })
  })

  it('should retrieve claim data and then call file generation', function () {
    getClaimsPendingPayment.resolves(claimsPendingPayment)
    getTopUpsPendingPayment.resolves(topUpsPendingPayment)
    return generateDirectPayments.execute({}).then(function () {
      expect(getClaimsPendingPayment.calledOnce).to.be.true //eslint-disable-line
      expect(createPaymentFile.calledWith(claimsPendingPayment)).to.be.true //eslint-disable-line
      expect(createAdiJournalFile.calledWith(total)).to.be.true //eslint-disable-line
      expect(insertDirectBankPayments.calledWith(testPath, fileTypes.ACCESSPAY_FILE)).to.be.true //eslint-disable-line
      expect(insertDirectBankPayments.calledWith(testAdiPath, fileTypes.ADI_JOURNAL_FILE)).to.be.true //eslint-disable-line
      expect(updateAllClaimsProcessedPayment.calledWith(['999997', '999998', '999999'], payments, true)).to.be.true //eslint-disable-line
      expect(updateAllTopupsProcessedPayment.calledWith(['123456', '123457', '123458'])).to.be.true //eslint-disable-line
    })
  })

  it('should find no data and not call file generation', function () {
    getClaimsPendingPayment.resolves(claimsMissingData)
    getTopUpsPendingPayment.resolves(topUpMissingData)
    return generateDirectPayments.execute({}).then(function () {
      expect(getClaimsPendingPayment.calledOnce).to.be.true //eslint-disable-line
      expect(createPaymentFile.calledWith(claimsPendingPayment)).to.be.false //eslint-disable-line
    })
      .catch(function (error) {
        expect(error.message).to.equal('Data is missing')
      })
  })

  it('should find missing top up data and valid claim data and not call file generation', function () {
    getClaimsPendingPayment.resolves(claimsPendingPayment)
    getTopUpsPendingPayment.resolves(topUpMissingData)
    return generateDirectPayments.execute({}).then(function () {
      expect(getClaimsPendingPayment.calledOnce).to.be.true //eslint-disable-line
      expect(createPaymentFile.calledWith(claimsPendingPayment)).to.be.false //eslint-disable-line
    })
      .catch(function (error) {
        expect(error.message).to.equal('Data is missing')
      })
  })
})
