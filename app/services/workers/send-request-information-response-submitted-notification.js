const config = require('../../../config')
const sendNotification = require('../notify/send-notification')
const getFirstNameByClaimId = require('../data/get-first-name-by-claimId')

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
      var emailTemplateId = config.NOTIFY_REQUEST_INFORMATION_RESPONSE_SUBMITTED_EMAIL_TEMPLATE_ID

      return sendNotification(emailTemplateId, emailAddress, personalisation)
    })
}
