const config = require('../../../config')
const sendNotification = require('../notify/send-notification')
const RatingEnum = require('../../constants/rating-enum')

module.exports.execute = function (task) {
  var feedback = task.additionalData.split('~~')
  var personalisation = {
    rating: RatingEnum[feedback[0]].displayName,
    improvements: feedback[1]
  }
  var emailAddress = config.APVS_FEEDBACK_EMAIL_ADDRESS
  var emailTemplateId = config.NOTIFY_SEND_FEEDBACK_EMAIL_TEMPLATE_ID
  return sendNotification(emailTemplateId, emailAddress, personalisation)
}
