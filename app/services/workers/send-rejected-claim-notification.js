const config = require('../../../config')
const sendNotification = require('../notify/send-notification')

module.exports.execute = function (task) {
  var reference = task.reference
  var personalisation = {reference: reference} // TODO rejection breakdown

  var emailAddress = task.additionalData
  var emailTemplateId = config.NOTIFY_REJECTED_CLAIM_EMAIL_TEMPLATE_ID

  return sendNotification(emailTemplateId, emailAddress, personalisation)
}
