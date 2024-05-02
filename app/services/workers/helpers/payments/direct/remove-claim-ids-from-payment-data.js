module.exports = function removeClaimIdsFromPaymentData(paymentData, claimIdIndex) {
  paymentData.forEach(function (data) {
    data.splice(claimIdIndex, 1)
  })

  return paymentData
}
