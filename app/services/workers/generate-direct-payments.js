const getClaimsPendingPayment = require('../data/get-claims-pending-payment')
const createPaymentFile = require('../direct-payments/create-payment-file')
const updateClaimsProcessedPayment = require('../data/update-claims-processed-payment')
const _ = require('lodash')

module.exports.execute = function (task) {
  var references

  return getClaimsPendingPayment()
    .then(function (paymentData) {
      references = _(paymentData).map(p => p.Reference)
      return createPaymentFile(paymentData)
        .then(function (filePath) {
          return updateClaimsProcessedPayment(references)
            .then(function () {
            })
        })
    })
}
