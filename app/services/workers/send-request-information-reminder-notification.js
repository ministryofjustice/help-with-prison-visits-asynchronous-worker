const config = require('../../../config')
const sendNotification = require('../notify/send-notification')
const getFirstNameByClaimId = require('../data/get-first-name-by-claimId')
const updateClaimReminderSentStatus = require('../data/update-claim-reminder-sent-status')
const moment = require('moment')

module.exports.execute = function (task) {
  var claimId = task.claimId
  var reference = task.reference

  return getFirstNameByClaimId('IntSchema', claimId)
    .then(function (firstName) {
      var requestInfoUrl = `${config.EXTERNAL_SERVICE_URL}${config.EXTERNAL_PATH_ALREADY_REGISTERED}`
      var personalisation = {
        first_name: firstName,
        reference: reference,
        requestInfoUrl: requestInfoUrl
      }

      var emailAddress = task.additionalData
      var emailTemplateId = config.NOTIFY_REQUEST_INFORMATION_REMINDER_EMAIL_TEMPLATE_ID

      return sendNotification(emailTemplateId, emailAddress, personalisation)
        .then(function () {
          const now = moment().format('YYYY-MM-DD HH:mm:ss.SSS')
          return updateClaimReminderSentStatus(claimId, now)
        })
    })
}
