const config = require('../../../config')
const log = require('../log')
const SFTPClient = require('sftp-promises')
const Promise = require('bluebird')

module.exports = function (paymentFilePathLocal, paymentFilePathRemote) {
  log.info(`sftp-send-payout-payment-file PAYOUT_SFTP_ENABLED: ${config.PAYOUT_SFTP_ENABLED}`)

  if (config.PAYOUT_SFTP_ENABLED === 'true') {
    var sftpConfig = {
      host: config.PAYOUT_SFTP_HOST,
      port: parseInt(config.PAYOUT_SFTP_PORT),
      username: config.PAYOUT_SFTP_USER,
      password: config.PAYOUT_SFTP_PASSWORD
    }

    var sftp = new SFTPClient(sftpConfig)

    log.info(`Sending file ${paymentFilePathLocal} to remote ${sftpConfig.host}:${paymentFilePathRemote}`)

    return sftp.put(paymentFilePathLocal, paymentFilePathRemote)
  } else {
    return Promise.resolve()
  }
}
