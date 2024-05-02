const _ = require('lodash')

module.exports = function getClaimIdsFromPaymentData(paymentData, claimIdIndex) {
  return _.map(paymentData, p => {
    return p[claimIdIndex]
  })
}
