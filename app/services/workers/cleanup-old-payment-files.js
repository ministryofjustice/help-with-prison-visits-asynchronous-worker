const knexConfig = require('../../../knexfile').asyncworker
const knex = require('knex')(knexConfig)
const config = require('../../../config')
const dateFormatter = require('../date-formatter')
const deleteOldPaymentFiles = require('../cleanup-old-data/delete-old-payment-files')
const updateOldPaymentFilesIsEnabledFalse = require('../data/update-old-payment-files-is-enabled-false')

const getOldPaymentFiles = function () {
  const numberOfDays = config.PAYMENT_CLEANUP_FILE_NUMBER_OF_DAYS
  const cleanupDate = dateFormatter.now().subtract(numberOfDays, 'days')

  return knex('IntSchema.DirectPaymentFile')
    .where('DateCreated', '<', cleanupDate.toDate())
    .where('IsEnabled', 'true')
}

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
  getOldPaymentFiles,
  cleanupOldPaymentFiles
}
