const getClaimsPendingPayment = require('../data/get-claims-pending-payment')
const getTopUpsPendingPayment = require('../data/get-topups-pending-payment')
const createPayoutFile = require('../payout-payments/create-payout-file')
const sftpSendPayoutPaymentFile = require('../sftp/sftp-send-payout-payment-file')
const insertDirectPaymentFile = require('../data/insert-direct-payment-file')
const fileTypes = require('../../constants/payment-filetype-enum')
const paymentMethods = require('../../constants/payment-method-enum')
const config = require('../../../config')
const path = require('path')
const combinePaymentWithTopups = require('./helpers/payments/combine-payments-with-topups')
const updateAllTopupsProcessedPayment = require('./helpers/payments/update-all-topups-processed-payment')
const updateAllClaimsProcessedPayment = require('./helpers/payments/update-all-claims-processed-payment')
const getClaimIdsFromPaymentData = require('./helpers/payments/get-claim-ids-from-payment-data')
const formatCSVData = require('./helpers/payments/payout/format-csv-data')

const generatePayoutPayments = function () {
  let claimIds
  let topUpClaimIds
  let paymentCsvFilename

  return getClaimsPendingPayment(paymentMethods.PAYOUT.value)
    .then(function (paymentData) {
      const claimIdIndex = 0
      if (paymentData.length > 0) {
        claimIds = getClaimIdsFromPaymentData(paymentData, claimIdIndex)
      }
      return getTopUpsPendingPayment(paymentMethods.PAYOUT.value)
        .then(function (topupData) {
          if (topupData.length > 0) {
            topUpClaimIds = getClaimIdsFromPaymentData(topupData, claimIdIndex)
          }
          paymentData = combinePaymentWithTopups(paymentData, topupData)
          if (paymentData.length > 0) {
            formatCSVData(paymentData, claimIdIndex)
            return createPayoutFile(paymentData)
              .then(function (filename) {
                paymentCsvFilename = filename
                const localFilePath = path.join(config.FILE_TMP_DIR, paymentCsvFilename)
                const remotePaypitCsvFilePath = `${config.PAYOUT_SFTP_REMOTE_PATH}${paymentCsvFilename}`

                return sftpSendPayoutPaymentFile(localFilePath, remotePaypitCsvFilePath)
              })
              .then(function () {
                return insertDirectPaymentFile(paymentCsvFilename, fileTypes.PAYOUT_FILE)
              })
              .then(function () {
                return updateAllClaimsProcessedPayment(claimIds, paymentData, false)
              })
              .then(function () {
                return updateAllTopupsProcessedPayment(topUpClaimIds)
              })
          }
        })
    })
}

module.exports = {
  generatePayoutPayments
}
