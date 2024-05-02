const moment = require('moment')
const updateClaimsProcessedPayment = require('../../../data/update-claims-processed-payment')

module.exports = function updateAllClaimsProcessedPayment(claimIds, paymentData, isBankPayment) {
  const promises = []

  const now = moment().format('YYYY-MM-DD HH:mm:ss.SSS')

  if (claimIds) {
    for (let i = 0; i < claimIds.length; i += 1) {
      const claimPaymentData = paymentData[i]
      const claimId = claimIds[i]

      let totalApprovedCostIndex
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
