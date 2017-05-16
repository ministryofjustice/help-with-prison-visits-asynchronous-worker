const config = require('../../../config')
const sendNotification = require('../notify/send-notification')

module.exports.execute = function (task) {
  var technicalHelp = task.additionalData.split('~~')
  var personalisation = {
    name: technicalHelp[0],
    contactEmailAddress: technicalHelp[1],
    issue: technicalHelp[2]
  }
  var emailAddress = config.APVS_FEEDBACK_EMAIL_ADDRESS
  var emailTemplateId = config.NOTIFY_SEND_TECHNICAL_HELP_EMAIL_TEMPLATE_ID
  return sendNotification(emailTemplateId, emailAddress, personalisation)
}
