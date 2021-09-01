const getClaimsPendingPayment = require('../data/get-claims-pending-payment')
const getTopUpsPendingPayment = require('../data/get-topups-pending-payment')
const createPaymentFile = require('../direct-payments/create-payment-file')
const createAdiJournalFile = require('../direct-payments/create-adi-journal-file')
const insertDirectPaymentFile = require('../data/insert-direct-payment-file')
const fileTypes = require('../../constants/payment-filetype-enum')
const paymentMethods = require('../../constants/payment-method-enum')
const log = require('../log')
const combinePaymentWithTopups = require('./helpers/payments/combine-payments-with-topups')
const updateAllTopupsProcessedPayment = require('./helpers/payments/update-all-topups-processed-payment')
const updateAllClaimsProcessedPayment = require('./helpers/payments/update-all-claims-processed-payment')
const getClaimIdsFromPaymentData = require('./helpers/payments/get-claim-ids-from-payment-data')
const removeClaimIdsFromPaymentData = require('./helpers/payments/direct/remove-claim-ids-from-payment-data')
const checkForAccountNumberAndSortCode = require('./helpers/payments/direct/check-for-account-number-and-sort-code')
const getTotalFromPaymentData = require('./helpers/payments/direct/get-total-from-payment-data')

const generateDirectPayments = function () {
  let claimIds
  let topUpClaimIds
  let total

  return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
    .then(function (paymentData) {
      const claimIdIndex = 0
      if (paymentData.length > 0) {
        claimIds = getClaimIdsFromPaymentData(paymentData, claimIdIndex)
      }
      return getTopUpsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
        .then(function (topupData) {
          if (topupData.length > 0) {
            topUpClaimIds = getClaimIdsFromPaymentData(topupData, claimIdIndex)
          }
          paymentData = combinePaymentWithTopups(paymentData, topupData)
          if (paymentData.length > 0) {
            const missingData = checkForAccountNumberAndSortCode(paymentData)
            if (missingData) {
              log.error(`Data is missing from direct payment ${paymentData}`)
              return Promise.reject(new Error('Data is missing'))
            }
            removeClaimIdsFromPaymentData(paymentData, claimIdIndex)

            total = getTotalFromPaymentData(paymentData)

            return createPaymentFile(paymentData, false)
              .then(function (apvsPaymentFilename) {
                return insertDirectPaymentFile(apvsPaymentFilename, fileTypes.ACCESSPAY_FILE)
              })
              .then(function () {
                return createPaymentFile(paymentData, true)
              })
              .then(function (apvuPaymentFilename) {
                return insertDirectPaymentFile(apvuPaymentFilename, fileTypes.APVU_ACCESSPAY_FILE)
              })
              .then(function () {
                return createAdiJournalFile(total)
              })
              .then(function (adiJournalFileName) {
                return insertDirectPaymentFile(adiJournalFileName, fileTypes.ADI_JOURNAL_FILE)
              })
              .then(function () {
                return updateAllClaimsProcessedPayment(claimIds, paymentData, true)
              })
              .then(function () {
                return updateAllTopupsProcessedPayment(topUpClaimIds)
              })
          }
        })
    })
}

module.exports = {
  generateDirectPayments
}
