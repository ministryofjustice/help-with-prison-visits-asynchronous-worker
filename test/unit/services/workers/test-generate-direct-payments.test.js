const fileTypes = require('../../../../app/constants/payment-filetype-enum')

const claimPaymentAmount1 = 45.5
const claimPaymentAmount2 = 22.22
const claimPaymentAmount3 = 13.99
const topUpPaymentAmount1 = 42.5
const topUpPaymentAmount2 = 20.22
const topUpPaymentAmount3 = 10.99
const total = '155.42'

const claimsPendingPayment = [
  ['999997', '223344', '12345678', 'Alan Turing', claimPaymentAmount1.toString(), 'REF1234'],
  ['999998', '334455', '87654321', 'Ada Lovelace', claimPaymentAmount2.toString(), 'REF4567'],
  ['999999', '998877', '54321678', 'Grace Hopper', claimPaymentAmount3.toString(), 'REF9876'],
]
const topUpsPendingPayment = [
  ['123456', '223344', '12345678', 'Alan Turing', topUpPaymentAmount1.toString(), 'REF1234'],
  ['123457', '334455', '87654321', 'Ada Lovelace', topUpPaymentAmount2.toString(), 'REF4567'],
  ['123458', '998877', '54321678', 'Grace Hopper', topUpPaymentAmount3.toString(), 'REF9876'],
]

const payments = [
  ['223344', '12345678', 'Alan Turing', '45.5', 'REF1234'],
  ['334455', '87654321', 'Ada Lovelace', '22.22', 'REF4567'],
  ['998877', '54321678', 'Grace Hopper', '13.99', 'REF9876'],
  ['223344', '12345678', 'Alan Turing', '42.5', 'REF1234'],
  ['334455', '87654321', 'Ada Lovelace', '20.22', 'REF4567'],
  ['998877', '54321678', 'Grace Hopper', '10.99', 'REF9876'],
]

const claimsMissingData = [['', '', '12345678', 'Alan Turing', claimPaymentAmount1.toString(), 'REF1234']]
const topUpMissingData = [['', '', '12345678', 'Alan Turing', topUpPaymentAmount1.toString(), 'REF1234']]

const testPath = 'data/payments/test.csv'
const testAdiPath = 'data/payments/adi.xlsm'

const mockGetClaimsPendingPayment = jest.fn()
const mockCreatePaymentFile = jest.fn()
const mockCreateAdiJournalFile = jest.fn()
const mockInsertDirectBankPayments = jest.fn()
const mockGetTopUpsPendingPayment = jest.fn()
const mockUpdateAllTopupsProcessedPayment = jest.fn()
const mockUpdateAllClaimsProcessedPayment = jest.fn()

let generateDirectPayments

describe('services/workers/generate-direct-payments', () => {
  beforeEach(() => {
    mockCreatePaymentFile.mockResolvedValue(testPath)
    mockCreateAdiJournalFile.mockResolvedValue(testAdiPath)
    mockInsertDirectBankPayments.mockResolvedValue()
    mockUpdateAllTopupsProcessedPayment.mockResolvedValue()
    mockUpdateAllClaimsProcessedPayment.mockResolvedValue()

    jest.mock('../../../../app/services/data/get-claims-pending-payment', () => mockGetClaimsPendingPayment)
    jest.mock('../../../../app/services/direct-payments/create-payment-file', () => mockCreatePaymentFile)
    jest.mock('../../../../app/services/direct-payments/create-adi-journal-file', () => mockCreateAdiJournalFile)
    jest.mock('../../../../app/services/data/insert-direct-payment-file', () => mockInsertDirectBankPayments)
    jest.mock('../../../../app/services/data/get-topups-pending-payment', () => mockGetTopUpsPendingPayment)
    jest.mock(
      '../../../../app/services/workers/helpers/payments/update-all-topups-processed-payment',
      () => mockUpdateAllTopupsProcessedPayment,
    )
    jest.mock(
      '../../../../app/services/workers/helpers/payments/update-all-claims-processed-payment',
      () => mockUpdateAllClaimsProcessedPayment,
    )

    generateDirectPayments = require('../../../../app/services/workers/generate-direct-payments')
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should retrieve claim data and then call file generation', () => {
    mockGetClaimsPendingPayment.mockResolvedValue(claimsPendingPayment)
    mockGetTopUpsPendingPayment.mockResolvedValue(topUpsPendingPayment)
    return generateDirectPayments.generateDirectPayments().then(() => {
      expect(mockGetClaimsPendingPayment).toHaveBeenCalledTimes(1)
      expect(mockCreatePaymentFile).toHaveBeenNthCalledWith(1, claimsPendingPayment, false)
      expect(mockCreatePaymentFile).toHaveBeenNthCalledWith(2, claimsPendingPayment, true)
      expect(mockCreateAdiJournalFile).toHaveBeenCalledWith(total)
      expect(mockInsertDirectBankPayments).toHaveBeenCalledWith(testPath, fileTypes.ACCESSPAY_FILE)
      expect(mockInsertDirectBankPayments).toHaveBeenCalledWith(testAdiPath, fileTypes.ADI_JOURNAL_FILE)
      expect(mockUpdateAllClaimsProcessedPayment).toHaveBeenCalledWith(['999997', '999998', '999999'], payments, true)
      expect(mockUpdateAllTopupsProcessedPayment).toHaveBeenCalledWith(['123456', '123457', '123458'])
    })
  })

  it('should find no data and not call file generation', () => {
    mockGetClaimsPendingPayment.mockResolvedValue(claimsMissingData)
    mockGetTopUpsPendingPayment.mockResolvedValue(topUpMissingData)
    return generateDirectPayments
      .generateDirectPayments()
      .then(() => {
        expect(mockGetClaimsPendingPayment).toHaveBeenCalledTimes(1)
        expect(mockCreatePaymentFile).not.toHaveBeenCalledWith(claimsPendingPayment)
      })
      .catch(error => {
        expect(error.message).toBe('Data is missing')
      })
  })

  it('should find missing top up data and valid claim data and not call file generation', () => {
    mockGetClaimsPendingPayment.mockResolvedValue(claimsPendingPayment)
    mockGetTopUpsPendingPayment.mockResolvedValue(topUpMissingData)
    return generateDirectPayments
      .generateDirectPayments()
      .then(() => {
        expect(mockGetClaimsPendingPayment).toHaveBeenCalledTimes(1)
        expect(mockCreatePaymentFile).not.toHaveBeenCalledWith(claimsPendingPayment)
      })
      .catch(error => {
        expect(error.message).toBe('Data is missing')
      })
  })
})
