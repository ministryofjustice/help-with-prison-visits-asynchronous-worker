const deleteOldPaymentFiles = require('../direct-payments/delete-old-payment-files')
const getOldPaymentFiles = require('../data/get-old-payment-files')
const updateOldPaymentFilesIsEnabledFalse = require('../data/update-old-payment-files-is-enabled-false')

module.exports.execute = function () {
  var oldPaymentIds
  return getOldPaymentFiles()
    .then(function (oldPaymentFiles) {
      if (oldPaymentFiles.length > 0) {
        oldPaymentIds = oldPaymentFiles.map(function (file) { return file.id })
        return deleteOldPaymentFiles(oldPaymentFiles)
          .then(function () {
            return updateOldPaymentFilesIsEnabledFalse(oldPaymentIds)
          })
      }
    })
}
