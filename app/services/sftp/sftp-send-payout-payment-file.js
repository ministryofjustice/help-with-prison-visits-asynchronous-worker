const config = require('../../../config')
const log = require('../log')
const SFTPClient = require('ssh2-sftp-client')

module.exports = function (paymentFilePathLocal, paymentFilePathRemote) {
  log.info(`sftp-send-payout-payment-file PAYOUT_SFTP_ENABLED: ${config.PAYOUT_SFTP_ENABLED}`)

  if (config.PAYOUT_SFTP_ENABLED) {
    const sftpConfig = {
      host: config.PAYOUT_SFTP_HOST,
      port: parseInt(config.PAYOUT_SFTP_PORT),
      username: config.PAYOUT_SFTP_USER,
      password: config.PAYOUT_SFTP_PASSWORD
    }

    const sftp = new SFTPClient()

    log.info(`Sending file ${paymentFilePathLocal} to remote ${sftpConfig.host}:${paymentFilePathRemote}`)

    sftp.connect(sftpConfig).then(() => {
      return sftp.fastPut(paymentFilePathLocal, paymentFilePathRemote)
    }).then(() => {
      return sftp.end()
    }).catch(error => {
      log.error('Error sending payment file', error)
      return Promise.resolve()
    })
  } else {
    return Promise.resolve()
  }
}
