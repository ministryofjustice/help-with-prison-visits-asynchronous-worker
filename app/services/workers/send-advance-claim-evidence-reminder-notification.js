const moment = require('moment')
const config = require('../../../config')
const getClaim = require('../data/get-claim')
const sendNotification = require('../notify/send-notification')
const getFirstNameByClaimId = require('../data/get-first-name-by-claimId')
const reminderEnum = require('../../constants/advance-claim-reminder-enum')

module.exports.execute = task => {
  const { claimId } = task
  const { reference } = task
  const requestInfoUrl = `${config.EXTERNAL_SERVICE_URL}${config.EXTERNAL_PATH_ALREADY_REGISTERED}`

  return getClaim('IntSchema', claimId).then(claim => {
    const dateOfJourneyString = moment(claim.DateOfJourney).format('D MMMM YYYY')

    return getFirstNameByClaimId('IntSchema', claimId).then(firstName => {
      const personalisation = { reference, requestInfoUrl, dateOfJourney: dateOfJourneyString, first_name: firstName }
      const additionalData = task.additionalData.split('~~')
      const emailAddress = additionalData[0]
      const reminder = additionalData[1]
      let emailTemplateId
      if (reminderEnum.FIRST === reminder) {
        emailTemplateId = config.NOTIFY_ADVANCE_CLAIM_EVIDENCE_REMINDER_TEMPLATE_ID
      } else if (reminderEnum.SECOND === reminder) {
        emailTemplateId = config.NOTIFY_ADVANCE_CLAIM_SECOND_EVIDENCE_REMINDER_TEMPLATE_ID
      } else {
        return Promise.reject(new Error('Not valid reminder type'))
      }

      return sendNotification(emailTemplateId, emailAddress, personalisation)
    })
  })
}
