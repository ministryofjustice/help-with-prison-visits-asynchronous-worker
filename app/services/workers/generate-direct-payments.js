const getClaimsPendingPayment = require('../data/get-claims-pending-payment')
const logger = require('../log')

module.exports.execute = function (task) {
  return getClaimsPendingPayment()
    .then(function (paymentData) {
      logger.info(paymentData)
    })
}
