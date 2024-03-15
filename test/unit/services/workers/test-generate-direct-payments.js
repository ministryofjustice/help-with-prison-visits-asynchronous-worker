const sinon = require('sinon')

const fileTypes = require('../../../../app/constants/payment-filetype-enum')

const claimPaymentAmount1 = 45.50
const claimPaymentAmount2 = 22.22
const claimPaymentAmount3 = 13.99
const topUpPaymentAmount1 = 42.50
const topUpPaymentAmount2 = 20.22
const topUpPaymentAmount3 = 10.99
const total = '155.42'

const claimsPendingPayment = [
  ['999997', '223344', '12345678', 'Alan Turing', claimPaymentAmount1.toString(), 'REF1234'],
  ['999998', '334455', '87654321', 'Ada Lovelace', claimPaymentAmount2.toString(), 'REF4567'],
  ['999999', '998877', '54321678', 'Grace Hopper', claimPaymentAmount3.toString(), 'REF9876']
]
const topUpsPendingPayment = [
  ['123456', '223344', '12345678', 'Alan Turing', topUpPaymentAmount1.toString(), 'REF1234'],
  ['123457', '334455', '87654321', 'Ada Lovelace', topUpPaymentAmount2.toString(), 'REF4567'],
  ['123458', '998877', '54321678', 'Grace Hopper', topUpPaymentAmount3.toString(), 'REF9876']
]

const payments = [
  ['223344', '12345678', 'Alan Turing', '45.5', 'REF1234'],
  ['334455', '87654321', 'Ada Lovelace', '22.22', 'REF4567'],
  ['998877', '54321678', 'Grace Hopper', '13.99', 'REF9876'],
  ['223344', '12345678', 'Alan Turing', '42.5', 'REF1234'],
  ['334455', '87654321', 'Ada Lovelace', '20.22', 'REF4567'],
  ['998877', '54321678', 'Grace Hopper', '10.99', 'REF9876']
]

const claimsMissingData = [['', '', '12345678', 'Alan Turing', claimPaymentAmount1.toString(), 'REF1234']]
const topUpMissingData = [['', '', '12345678', 'Alan Turing', topUpPaymentAmount1.toString(), 'REF1234']]

const testPath = 'data/payments/test.csv'
const testAdiPath = 'data/payments/adi.xlsm'

let generateDirectPayments
let getClaimsPendingPayment
let createPaymentFile
let createAdiJournalFile
let insertDirectBankPayments
let getTopUpsPendingPayment
let updateAllTopupsProcessedPayment
let updateAllClaimsProcessedPayment

jest.mock('../data/get-claims-pending-payment', () => getClaimsPendingPayment);
jest.mock('../direct-payments/create-payment-file', () => createPaymentFile);
jest.mock('../direct-payments/create-adi-journal-file', () => createAdiJournalFile);
jest.mock('../data/insert-direct-payment-file', () => insertDirectBankPayments);
jest.mock('../data/get-topups-pending-payment', () => getTopUpsPendingPayment);

jest.mock(
  './helpers/payments/update-all-topups-processed-payment',
  () => updateAllTopupsProcessedPayment
);

jest.mock(
  './helpers/payments/update-all-claims-processed-payment',
  () => updateAllClaimsProcessedPayment
);

describe('services/workers/generate-direct-payments', function () {
  beforeEach(function () {
    getClaimsPendingPayment = sinon.stub()
    createPaymentFile = sinon.stub().resolves(testPath)
    createAdiJournalFile = sinon.stub().resolves(testAdiPath)
    insertDirectBankPayments = sinon.stub().resolves()
    getTopUpsPendingPayment = sinon.stub()
    updateAllTopupsProcessedPayment = sinon.stub().resolves()
    updateAllClaimsProcessedPayment = sinon.stub().resolves()

    generateDirectPayments = require('../../../../app/services/workers/generate-direct-payments')
  })

  it('should retrieve claim data and then call file generation', function () {
    getClaimsPendingPayment.resolves(claimsPendingPayment)
    getTopUpsPendingPayment.resolves(topUpsPendingPayment)
    return generateDirectPayments.generateDirectPayments().then(function () {
      expect(getClaimsPendingPayment.calledOnce).toBe(true) //eslint-disable-line
      expect(createPaymentFile.calledWith(claimsPendingPayment)).toBe(true) //eslint-disable-line
      expect(createAdiJournalFile.calledWith(total)).toBe(true) //eslint-disable-line
      expect(insertDirectBankPayments.calledWith(testPath, fileTypes.ACCESSPAY_FILE)).toBe(true) //eslint-disable-line
      expect(insertDirectBankPayments.calledWith(testAdiPath, fileTypes.ADI_JOURNAL_FILE)).toBe(true) //eslint-disable-line
      expect(updateAllClaimsProcessedPayment.calledWith(['999997', '999998', '999999'], payments, true)).toBe(true) //eslint-disable-line
      expect(updateAllTopupsProcessedPayment.calledWith(['123456', '123457', '123458'])).toBe(true) //eslint-disable-line
    });
  })

  it('should find no data and not call file generation', function () {
    getClaimsPendingPayment.resolves(claimsMissingData)
    getTopUpsPendingPayment.resolves(topUpMissingData)
    return generateDirectPayments.generateDirectPayments().then(function () {
      expect(getClaimsPendingPayment.calledOnce).toBe(true) //eslint-disable-line
      expect(createPaymentFile.calledWith(claimsPendingPayment)).toBe(false) //eslint-disable-line
    })
      .catch(function (error) {
        expect(error.message).toBe('Data is missing')
      });
  })

  it('should find missing top up data and valid claim data and not call file generation', function () {
    getClaimsPendingPayment.resolves(claimsPendingPayment)
    getTopUpsPendingPayment.resolves(topUpMissingData)
    return generateDirectPayments.generateDirectPayments().then(function () {
      expect(getClaimsPendingPayment.calledOnce).toBe(true) //eslint-disable-line
      expect(createPaymentFile.calledWith(claimsPendingPayment)).toBe(false) //eslint-disable-line
    })
      .catch(function (error) {
        expect(error.message).toBe('Data is missing')
      });
  })
})
