const config = require('../../../config')
const NotifyClient = require('notifications-node-client').NotifyClient
const Promise = require('bluebird')

module.exports = function (emailTemplateId, emailAddress, personalisation) {
  var notifyClient = new NotifyClient(
    config.NOTIFY_API_URL,
    config.NOTIFY_CLIENT_ID,
    config.NOTIFY_API_KEY
  )

  if (emailAddress !== config.NOTIFY_DO_NOT_SEND_EMAIL) {
    return notifyClient.sendEmail(emailTemplateId, emailAddress, personalisation)
  } else {
    return Promise.resolve('not sent!')
  }
}
