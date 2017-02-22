const getClaimsPendingPayment = require('../data/get-claims-pending-payment')
const createPayoutFile = require('../payout-payments/create-payout-file')
const updateClaimsProcessedPayment = require('../data/update-claims-processed-payment')
const insertDirectPaymentFile = require('../data/insert-direct-payment-file')
const fileTypes = require('../../constants/payment-filetype-enum')
const _ = require('lodash')
const paymentMethods = require('../../constants/payment-method-enum')

module.exports.execute = function (task) {
  var claimIds

  return getClaimsPendingPayment(paymentMethods.PAYOUT.value)
    .then(function (paymentData) {
      if (paymentData.length > 0) {
        var claimIdIndex = 0
        claimIds = getClaimIdsFromPaymentData(paymentData, claimIdIndex)
        formatData(paymentData, claimIdIndex)
        return createPayoutFile(paymentData)
          .then(function (result) {
            return insertDirectPaymentFile(result, fileTypes.PAYOUT_FILE)
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

function formatData (paymentData, claimIdIndex) {
  paymentData.forEach(function (data) {
    data.splice(claimIdIndex, 1)
    data.splice(1, 0, '')
    data.splice(9, 0, '3', '', '')
    data.splice(13, 0, '', '', '', '', '')
  })

  return paymentData
}

// Makes it specific layout for post office payout

function updateAllClaimsProcessedPayment (claimIds, paymentData) {
  var promises = []

  for (var i = 0; i < claimIds.length; i++) {
    var claimPaymentData = paymentData[i]
    var claimId = claimIds[i]

    var totalApprovedCostIndex = 0
    promises.push(updateClaimsProcessedPayment(claimId, parseFloat(claimPaymentData[totalApprovedCostIndex])))
  }

  return Promise.all(promises)
}
