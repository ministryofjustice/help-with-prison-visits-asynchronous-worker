const config = require('../../../config')
const NotifyClient = require('notifications-node-client').NotifyClient

module.exports.execute = function (task) {
  var notifyClient = new NotifyClient(
    config.NOTIFY_API_URL,
    config.NOTIFY_CLIENT_ID,
    config.NOTIFY_API_KEY
  )
  var reference = task.reference
  var personalisation = {reference: reference}

  var emailAddress = task.additionalData
  var emailTemplateId = config.NOTIFY_FIRST_TIME_CLAIM_EMAIL_TEMPLATE_ID

  return notifyClient.sendEmail(emailTemplateId, emailAddress, personalisation)
}
