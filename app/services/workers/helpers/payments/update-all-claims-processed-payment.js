const updateClaimsProcessedPayment = require('../../../data/update-claims-processed-payment')
const moment = require('moment')

module.exports = function updateAllClaimsProcessedPayment (claimIds, paymentData, isBankPayment) {
  var promises = []

  var now = moment().format('YYYY-MM-DD HH:mm:ss.SSS')

  if (claimIds) {
    for (var i = 0; i < claimIds.length; i++) {
      var claimPaymentData = paymentData[i]
      var claimId = claimIds[i]

      var totalApprovedCostIndex
      if (isBankPayment) {
        totalApprovedCostIndex = 3
      } else {
        totalApprovedCostIndex = 0
      }
      promises.push(updateClaimsProcessedPayment(claimId, parseFloat(claimPaymentData[totalApprovedCostIndex]), now))
    }
  }
  return Promise.all(promises)
}
