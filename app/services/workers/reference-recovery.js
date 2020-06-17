const config = require('../../../config')
const sendNotification = require('../notify/send-notification')
const referenceNumberRecovery = require('../data/reference-number-recovery')

module.exports.execute = function (task) {
  var recoveryRequest = task.additionalData.split('~~')
  var emailAddress = recoveryRequest[0]
  var prisonNumber = recoveryRequest[1]

  return referenceNumberRecovery(emailAddress, prisonNumber)
    .then(function (data) {
      if (data) {
        var registeredUrl = `${config.EXTERNAL_SERVICE_URL}${config.EXTERNAL_PATH_ALREADY_REGISTERED}`
        var personalisation = { reference: data.Reference, firstname: data.FirstName, registeredUrl }
        var emailTemplateId = config.NOTIFY_SEND_REFERENCE_RECOVERY_EMAIL_TEMPLATE_ID
        return sendNotification(emailTemplateId, emailAddress, personalisation)
      }
    })
}
