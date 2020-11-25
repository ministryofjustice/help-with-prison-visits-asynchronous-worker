const config = require('../../../config')
const sendNotification = require('../notify/send-notification')
const referenceNumberRecovery = require('../data/reference-number-recovery')

module.exports.execute = function (task) {
  const recoveryRequest = task.additionalData.split('~~')
  const emailAddress = recoveryRequest[0]
  const prisonNumber = recoveryRequest[1]

  return referenceNumberRecovery(emailAddress, prisonNumber)
    .then(function (data) {
      if (data) {
        const registeredUrl = `${config.EXTERNAL_SERVICE_URL}${config.EXTERNAL_PATH_ALREADY_REGISTERED}`
        const personalisation = { reference: data.Reference, firstname: data.FirstName, registeredUrl }
        const emailTemplateId = config.NOTIFY_SEND_REFERENCE_RECOVERY_EMAIL_TEMPLATE_ID
        return sendNotification(emailTemplateId, emailAddress, personalisation)
      }
    })
}
