const AWSHelper = require('../aws-helper')
const log = require('../log')

const aws = new AWSHelper()

module.exports = oldPaymentFiles => {
  oldPaymentFiles.forEach(async paymentFile => {
    try {
      log.info(`Deleting payment file: ${paymentFile.Filepath}`)
      await aws.delete(paymentFile.Filepath)
    } catch (error) {
      log.error(`Failed to delete payment file: ${paymentFile.Filepath}`, error)
    }
  })

  return Promise.resolve()
}
