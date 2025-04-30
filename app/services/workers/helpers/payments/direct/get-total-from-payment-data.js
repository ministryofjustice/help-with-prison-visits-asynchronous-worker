module.exports = function getTotalFromPaymentData(paymentData) {
  const totalApprovedCostIndex = 3
  let total = 0.0

  paymentData.forEach(data => {
    total += parseFloat(data[totalApprovedCostIndex])
  })

  return Number(total).toFixed(2)
}
