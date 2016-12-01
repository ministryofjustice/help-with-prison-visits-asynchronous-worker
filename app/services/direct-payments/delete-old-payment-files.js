const unlinkSync = require('fs').unlinkSync

module.exports = function (oldPaymentFiles) {
  return oldPaymentFiles.forEach(function (paymentFile) {
    unlinkSync(paymentFile.Filepath)
  })
}
