module.exports = function combinePaymentWithTopups(paymentData, topupData) {
  topupData.forEach(topup => {
    paymentData.push(topup)
  })
  return paymentData
}
