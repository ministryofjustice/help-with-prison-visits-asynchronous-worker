const deleteOldPaymentFiles = require('../cleanup-old-data/delete-old-payment-files')
const { getOldPaymentFiles } = require('../data/get-old-payment-files')
const log = require('../log')
const updateOldPaymentFilesIsEnabledFalse = require('../data/update-old-payment-files-is-enabled-false')

const cleanupOldPaymentFiles = function () {
  log.info('Cleaning up old payment files')
  let oldPaymentIds
  return getOldPaymentFiles().then(function (oldPaymentFiles) {
    if (oldPaymentFiles.length > 0) {
      oldPaymentIds = oldPaymentFiles.map(function (file) {
        return file.PaymentFileId
      })
      log.info('Old payment files found, setting IsEnabled to false')
      return updateOldPaymentFilesIsEnabledFalse(oldPaymentIds).then(function () {
        deleteOldPaymentFiles(oldPaymentFiles)
      })
    }
    log.info('No old payment files found')
    return Promise.resolve()
  })
}

module.exports = {
  cleanupOldPaymentFiles,
}
