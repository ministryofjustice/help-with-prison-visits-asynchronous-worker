const getClaimsPendingPayment = require('../data/get-claims-pending-payment')
const createPaymentFile = require('../direct-payments/create-payment-file')
const updateClaimsProcessedPayment = require('../data/update-claims-processed-payment')
const insertDirectPaymentFile = require('../data/insert-direct-payment-file')
const fileTypes = require('../../constants/payment-filetype-enum')
const _ = require('lodash')

module.exports.execute = function (task) {
  var references

  return getClaimsPendingPayment()
    .then(function (paymentData) {
      if (paymentData.length > 0) {
        var referenceIndex = 4
        references = _.map(paymentData, p => { return p[referenceIndex] })

        return createPaymentFile(paymentData)
          .then(function (result) {
            return insertDirectPaymentFile(result, fileTypes.ACCESSPAY_FILE)
              .then(function () {
                return updateClaimsProcessedPayment(references)
              })
          })
      }
    })
}
