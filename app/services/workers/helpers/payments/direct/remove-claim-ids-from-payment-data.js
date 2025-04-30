module.exports = function removeClaimIdsFromPaymentData(paymentData, claimIdIndex) {
  paymentData.forEach(data => {
    data.splice(claimIdIndex, 1)
  })

  return paymentData
}
