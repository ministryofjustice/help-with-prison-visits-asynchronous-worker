const OLD_PAYMENT_FILES = [
  {
    PaymentFileId: '1',
    FileType: 'TEST',
    DateCreated: '2016-11-29T17:03:29.746Z',
    Filepath: 'filepath/test.csv',
    IsEnabled: 'true',
  },
]

const mockDeleteOldPaymentFiles = jest.fn().mockResolvedValue()
const mockGetOldPaymentFiles = { getOldPaymentFiles: jest.fn().mockResolvedValue(OLD_PAYMENT_FILES) }
const mockUpdateOldPaymentFilesIsEnabledFalse = jest.fn().mockResolvedValue()

jest.mock('../../../../app/services/cleanup-old-data/delete-old-payment-files', () => mockDeleteOldPaymentFiles)

jest.mock('../../../../app/services/data/get-old-payment-files', () => mockGetOldPaymentFiles)

jest.mock(
  '../../../../app/services/data/update-old-payment-files-is-enabled-false',
  () => mockUpdateOldPaymentFilesIsEnabledFalse,
)

const cleanupOldPaymentFiles = require('../../../../app/services/workers/cleanup-old-payment-files')

describe('services/workers/cleanup-old-payment-files', function () {
  it('should get old payment files, delete them, and update their IsEnabled status', function () {
    return cleanupOldPaymentFiles.cleanupOldPaymentFiles().then(function () {
      expect(mockDeleteOldPaymentFiles).toHaveBeenCalledWith(OLD_PAYMENT_FILES)
      expect(mockGetOldPaymentFiles.getOldPaymentFiles).toHaveBeenCalledTimes(1)
      expect(mockUpdateOldPaymentFilesIsEnabledFalse).toHaveBeenCalledWith([OLD_PAYMENT_FILES[0].PaymentFileId])
    })
  })
})
