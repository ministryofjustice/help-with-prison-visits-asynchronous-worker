module.exports = function checkForAccountNumberAndSortCode (paymentData) {
  let missingData = false
  paymentData.forEach(function (data) {
    // Checks Account Number and Sort Code
    if (!data[1] || !data[2]) {
      missingData = true
    }
  })

  return missingData
}
