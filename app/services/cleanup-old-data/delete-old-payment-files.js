const unlinkSync = require('fs').unlinkSync

module.exports = function (oldPaymentFiles) {
  oldPaymentFiles.forEach(function (paymentFile) {
    unlinkSync(paymentFile.Filepath)
  })
  return Promise.resolve()
}
