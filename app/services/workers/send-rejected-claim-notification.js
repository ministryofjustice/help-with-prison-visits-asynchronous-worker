const config = require('../../../config')
const sendNotification = require('../notify/send-notification')
const getFirstNameByClaimId = require('../data/get-first-name-by-claimId')

module.exports.execute = function (task) {
  var reference = task.reference

  return getFirstNameByClaimId('IntSchema', reference)
  .then(function (result) {
    var requestInfoUrl = `${config.EXTERNAL_SERVICE_URL}${config.EXTERNAL_PATH_ALREADY_REGISTERED}`
    var personalisation = {
      first_name: result.FirstName,
      reference: reference,
      requestInfoUrl: requestInfoUrl
    }

    var emailAddress = task.additionalData
    var emailTemplateId = config.NOTIFY_REJECTED_CLAIM_EMAIL_TEMPLATE_ID

    return sendNotification(emailTemplateId, emailAddress, personalisation)
  })
}
