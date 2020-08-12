module.exports = function getTotalFromPaymentData (paymentData) {
  var totalApprovedCostIndex = 3
  var total = 0.0

  paymentData.forEach(function (data) { total += parseFloat(data[totalApprovedCostIndex]) })

  return Number(total).toFixed(2)
}
