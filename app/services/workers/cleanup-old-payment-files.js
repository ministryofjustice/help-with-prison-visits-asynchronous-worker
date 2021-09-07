const deleteOldPaymentFiles = require('../cleanup-old-data/delete-old-payment-files')
const { getOldPaymentFiles } = require('../data/get-old-payment-files')
const updateOldPaymentFilesIsEnabledFalse = require('../data/update-old-payment-files-is-enabled-false')

const cleanupOldPaymentFiles = function () {
  let oldPaymentIds
  return getOldPaymentFiles()
    .then(function (oldPaymentFiles) {
      if (oldPaymentFiles.length > 0) {
        oldPaymentIds = oldPaymentFiles.map(function (file) { return file.PaymentFileId })
        return updateOldPaymentFilesIsEnabledFalse(oldPaymentIds)
          .then(function () {
            deleteOldPaymentFiles(oldPaymentFiles)
          })
      }
    })
}

module.exports = {
  cleanupOldPaymentFiles
}
