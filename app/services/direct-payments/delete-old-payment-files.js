const Promise = require('bluebird')
// const unlink = require('fs').unlink
const unlink = Promise.promisify(require('fs').unlink)

module.exports = function (oldPaymentFiles) {
  oldPaymentFiles.forEach(function (paymentFile) {
    return unlink(paymentFile.Filepath)
  })
  return Promise.resolve()
}
