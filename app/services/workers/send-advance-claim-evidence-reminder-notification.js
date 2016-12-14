const config = require('../../../config')
const moment = require('moment')
const getClaim = require('../data/get-claim')
const sendNotification = require('../notify/send-notification')

module.exports.execute = function (task) {
  return getClaim('IntSchema', task.claimId)
    .then(function (claim) {
      var reference = task.reference
      var requestInfoUrl = `${config.EXTERNAL_SERVICE_URL}${config.EXTERNAL_PATH_ALREADY_REGISTERED}`
      var dateOfJourneyString = moment(claim.DateOfJourney).format('D MMMM YYYY')
      var personalisation = {reference: reference, requestInfoUrl: requestInfoUrl, dateOfJourney: dateOfJourneyString}

      var emailAddress = task.additionalData
      var emailTemplateId = config.NOTIFY_ADVANCE_CLAIM_EVIDENCE_REMINDER_TEMPLATE_ID

      return sendNotification(emailTemplateId, emailAddress, personalisation)
    })
}
