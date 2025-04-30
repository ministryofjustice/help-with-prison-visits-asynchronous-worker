const config = require('../../../config')
const sendNotification = require('../notify/send-notification')
const getFirstNameByClaimId = require('../data/get-first-name-by-claimId')

module.exports.execute = task => {
  const { claimId } = task
  const { reference } = task

  return getFirstNameByClaimId('IntSchema', claimId).then(firstName => {
    const requestInfoUrl = `${config.EXTERNAL_SERVICE_URL}${config.EXTERNAL_PATH_ALREADY_REGISTERED}`
    const personalisation = {
      first_name: firstName,
      reference,
      requestInfoUrl,
    }

    const emailAddress = task.additionalData
    const emailTemplateId = config.NOTIFY_SUBMIT_CLAIM_EMAIL_TEMPLATE_ID

    return sendNotification(emailTemplateId, emailAddress, personalisation)
  })
}
