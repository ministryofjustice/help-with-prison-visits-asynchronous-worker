const config = require('../../../config')
const sendNotification = require('../notify/send-notification')

module.exports.execute = function (task) {
  var reference = task.reference
  var personalisation = {reference: reference}

  var emailAddress = task.additionalData
  var emailTemplateId = config.NOTIFY_REQUEST_INFORMATION_RESPONSE_SUBMITTED_EMAIL_TEMPLATE_ID

  return sendNotification(emailTemplateId, emailAddress, personalisation)
}
