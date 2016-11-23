const getClaimsPendingPayment = require('../data/get-claims-pending-payment')
const createPaymentFile = require('../direct-payments/create-payment-file')
const logger = require('../log')

module.exports.execute = function (task) {
  return getClaimsPendingPayment()
    .then(function (paymentData) {
      return createPaymentFile(paymentData)
        .then(function (filePath) {
          logger.info(filePath)
        })
    })
}
