module.exports = function getClaimIdsFromPaymentData(paymentData, claimIdIndex) {
  return paymentData.map(p => p[claimIdIndex])
}
