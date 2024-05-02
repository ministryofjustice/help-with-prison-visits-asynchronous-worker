module.exports = function combinePaymentWithTopups(paymentData, topupData) {
  topupData.forEach(function (topup) {
    paymentData.push(topup)
  })
  return paymentData
}
