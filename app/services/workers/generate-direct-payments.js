const getClaimsPendingPayment = require('../data/get-claims-pending-payment')
const createPaymentFile = require('../direct-payments/create-payment-file')
const updateClaimsProcessedPayment = require('../data/update-claims-processed-payment')
const insertDirectPaymentFile = require('../data/insert-direct-payment-file')
const fileTypes = require('../../constants/payment-filetype-enum')
const _ = require('lodash')

module.exports.execute = function (task) {
  var claimIds

  return getClaimsPendingPayment()
    .then(function (paymentData) {
      if (paymentData.length > 0) {
        var claimIdIndex = 0
        claimIds = getClaimIdsFromPaymentData(paymentData, claimIdIndex)
        removeClaimIdsFromPaymentData(paymentData, claimIdIndex)

        return createPaymentFile(paymentData)
          .then(function (result) {
            return insertDirectPaymentFile(result, fileTypes.ACCESSPAY_FILE)
              .then(function () {
                return updateAllClaimsProcessedPayment(claimIds, paymentData)
              })
          })
      }
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

  for (var i = 0; i < claimIds.length; i++) {
    var claimPaymentData = paymentData[i]
    var claimId = claimIds[i]

    var totalApprovedCostIndex = 3
    promises.push(updateClaimsProcessedPayment(claimId, parseFloat(claimPaymentData[totalApprovedCostIndex])))
  }

  return Promise.all(promises)
}
