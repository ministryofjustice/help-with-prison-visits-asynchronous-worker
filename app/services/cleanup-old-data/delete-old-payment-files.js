const { AWSHelper } = require('../aws-helper')
const aws = new AWSHelper()

module.exports = function (oldPaymentFiles) {
  oldPaymentFiles.forEach(async function (paymentFile) {
    await aws.delete(paymentFile.Filepath)
  })
  return Promise.resolve()
}
