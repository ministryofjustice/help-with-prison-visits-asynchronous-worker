const { NotifyClient } = require('notifications-node-client')
const config = require('../../../config')
const log = require('../log')

module.exports = (emailTemplateId, emailAddress, personalisation) => {
  const notifyClient = new NotifyClient(config.NOTIFY_API_URL, config.NOTIFY_CLIENT_ID, config.NOTIFY_API_KEY)

  if (emailAddress !== config.NOTIFY_DO_NOT_SEND_EMAIL) {
    return notifyClient.sendEmail(emailTemplateId, emailAddress, { personalisation }).catch(error => {
      log.error(error)
      throw error
    })
  }
  return Promise.resolve('not sent!')
}
