const { AWSHelper } = require('../aws-helper')
const log = require('../../services/log')
const aws = new AWSHelper()

module.exports = function (oldPaymentFiles) {
  oldPaymentFiles.forEach(async function (paymentFile) {
    try {
      log.info(`Deleting payment file: ${paymentFile.Filepath}`)
      await aws.delete(paymentFile.Filepath)
    } catch (error) {
      log.error(`Failed to delete payment file: ${paymentFile.Filepath}`, error)
    }
  })

  return Promise.resolve()
}
