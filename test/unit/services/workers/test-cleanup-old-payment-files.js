const OLD_PAYMENT_FILES = [{
  PaymentFileId: '1',
  FileType: 'TEST',
  DateCreated: '2016-11-29T17:03:29.746Z',
  Filepath: 'filepath/test.csv',
  IsEnabled: 'true'
}]

const deleteOldPaymentFiles = jest.fn().mockResolvedValue()
const getOldPaymentFiles = { getOldPaymentFiles: jest.fn().mockResolvedValue(OLD_PAYMENT_FILES) }
const updateOldPaymentFilesIsEnabledFalse = jest.fn().mockResolvedValue()

jest.mock(
  '../cleanup-old-data/delete-old-payment-files',
  () => deleteOldPaymentFiles
)

jest.mock('../data/get-old-payment-files', () => getOldPaymentFiles)

jest.mock(
  '../data/update-old-payment-files-is-enabled-false',
  () => updateOldPaymentFilesIsEnabledFalse
)

const cleanupOldPaymentFiles = require('../../../../app/services/workers/cleanup-old-payment-files')

describe('services/workers/cleanup-old-payment-files', function () {
  it('should get old payment files, delete them, and update their IsEnabled status', function () {
    return cleanupOldPaymentFiles.cleanupOldPaymentFiles().then(function () {
      expect(deleteOldPaymentFiles.calledWith(OLD_PAYMENT_FILES)).toBe(true) //eslint-disable-line
      expect(getOldPaymentFiles.getOldPaymentFiles.calledOnce).toBe(true) //eslint-disable-line
      expect(updateOldPaymentFilesIsEnabledFalse.calledWith(OLD_PAYMENT_FILES[0].PaymentFileId))
    })
  })
})
