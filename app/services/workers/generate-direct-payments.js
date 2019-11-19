const getClaimsPendingPayment = require('../data/get-claims-pending-payment')
const getTopUpsPendingPayment = require('../data/get-topups-pending-payment')
const createPaymentFile = require('../direct-payments/create-payment-file')
const createAdiJournalFile = require('../direct-payments/create-adi-journal-file')
const updateClaimsProcessedPayment = require('../data/update-claims-processed-payment')
const updateTopupsProcessedPayment = require('../data/update-topups-processed-payment')
const insertDirectPaymentFile = require('../data/insert-direct-payment-file')
const fileTypes = require('../../constants/payment-filetype-enum')
const _ = require('lodash')
const paymentMethods = require('../../constants/payment-method-enum')
const log = require('../log')
const dateFormatter = require('../date-formatter')

module.exports.execute = function (task) {
  var claimIds
  var topUpClaimIds
  var total

  return getClaimsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
    .then(function (paymentData) {
      return getTopUpsPendingPayment(paymentMethods.DIRECT_BANK_PAYMENT.value)
        .then(function (topupData) {       
          if (paymentData.length + topupData.length > 0) {
            var claimIdIndex = 0
            claimIds = getClaimIdsFromPaymentData(paymentData, claimIdIndex)
            topUpClaimIds = getClaimIdsFromPaymentData(topupData, claimIdIndex)
            topupData.forEach(function(topup){
              paymentData.push(topup)
            })
            var missingData = checkForAccountNumberAndSortCode(paymentData)
            if (missingData) {
              log.info(`Data is missing from direct payment ${paymentData}`)
              return Promise.reject('Data is missing')
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
                return updateAllClaimsProcessedPayment(claimIds, paymentData)
              })
              .then(function(){
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

function updateAllClaimsProcessedPayment (claimIds, paymentData) {
  var promises = []

  var now = dateFormatter.now().toDate()

  for (var i = 0; i < claimIds.length; i++) {
    var claimPaymentData = paymentData[i]
    var claimId = claimIds[i]

    var totalApprovedCostIndex = 3
    promises.push(updateClaimsProcessedPayment(claimId, parseFloat(claimPaymentData[totalApprovedCostIndex]), now))
  }

  return Promise.all(promises)
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

function updateAllTopupsProcessedPayment (claimIds) {
  var promises = []

  var now = dateFormatter.now().toDate()

  for (var i = 0; i < claimIds.length; i++) {
    var claimId = claimIds[i]
    promises.push(updateTopupsProcessedPayment(claimId, now))
  }

  return Promise.all(promises)
}
