const getClaimsPendingPayment = require('../data/get-claims-pending-payment')
const getTopUpsPendingPayment = require('../data/get-topups-pending-payment')
const createPaymentFile = require('../direct-payments/create-payment-file')
const createAdiJournalFile = require('../direct-payments/create-adi-journal-file')
const insertDirectPaymentFile = require('../data/insert-direct-payment-file')
const fileTypes = require('../../constants/payment-filetype-enum')
const _ = require('lodash')
const paymentMethods = require('../../constants/payment-method-enum')
const log = require('../log')
const combinePaymentWithTopups = require('./helpers/combine-payments-with-topups')
const updateAllTopupsProcessedPayment = require('./helpers/update-all-topups-processed-payment')
const updateAllClaimsProcessedPayment = require('./helpers/update-all-claims-processed-payment')

module.exports.execute = function (task) {
  var claimIds
  var topUpClaimIds
  var total

  return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
    .then(function (paymentData) {
      var claimIdIndex = 0
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
            var missingData = checkForAccountNumberAndSortCode(paymentData)
            if (missingData) {
              log.error(`Data is missing from direct payment ${paymentData}`)
              return Promise.reject(new Error('Data is missing'))
            }
            removeClaimIdsFromPaymentData(paymentData, claimIdIndex)

            total = getTotalFromPaymentData(paymentData)

            return createPaymentFile(paymentData, false)
              .then(function (result) {
                return insertDirectPaymentFile(result, fileTypes.ACCESSPAY_FILE)
              })
              .then(function () {
                return createPaymentFile(paymentData, true)
              })
              .then(function (result) {
                return insertDirectPaymentFile(result, fileTypes.APVU_ACCESSPAY_FILE)
              })
              .then(function () {
                return createAdiJournalFile(total)
              })
              .then(function (result) {
                return insertDirectPaymentFile(result, fileTypes.ADI_JOURNAL_FILE)
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

function getClaimIdsFromPaymentData (paymentData, claimIdIndex) {
  return _.map(paymentData, p => { return p[claimIdIndex] })
}

function removeClaimIdsFromPaymentData (paymentData, claimIdIndex) {
  paymentData.forEach(function (data) { data.splice(claimIdIndex, 1) })

  return paymentData
}

function checkForAccountNumberAndSortCode (paymentData) {
  var missingData = false
  paymentData.forEach(function (data) {
    // Checks Account Number and Sort Code
    if (!data[0] || !data[1]) {
      missingData = true
    }
  })

  return missingData
}

function getTotalFromPaymentData (paymentData) {
  var totalApprovedCostIndex = 3
  var total = 0.0

  paymentData.forEach(function (data) { total += parseFloat(data[totalApprovedCostIndex]) })

  return Number(total).toFixed(2)
}
