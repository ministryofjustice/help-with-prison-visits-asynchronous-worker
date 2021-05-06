const { AWSHelper } = require('../aws-helper')
const aws = new AWSHelper()

module.exports = function (oldPaymentFiles) {
  oldPaymentFiles.forEach(function (paymentFile) {
    aws.delete(paymentFile.Filepath)
  })
  return Promise.resolve()
}
