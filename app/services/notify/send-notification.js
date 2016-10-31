const config = require('../../../config')
const NotifyClient = require('notifications-node-client').NotifyClient

module.exports = function (emailTemplateId, emailAddress, personalisation) {
  var notifyClient = new NotifyClient(
    config.NOTIFY_API_URL,
    config.NOTIFY_CLIENT_ID,
    config.NOTIFY_API_KEY
  )
  return notifyClient.sendEmail(emailTemplateId, emailAddress, personalisation)
}
