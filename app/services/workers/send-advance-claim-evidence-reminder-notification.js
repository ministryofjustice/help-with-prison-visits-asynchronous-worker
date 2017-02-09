const config = require('../../../config')
const moment = require('moment')
const getClaim = require('../data/get-claim')
const sendNotification = require('../notify/send-notification')
const getFirstNameByClaimId = require('../data/get-first-name-by-claimId')

module.exports.execute = function (task) {
  var claimId = task.claimId
  var reference = task.reference
  var requestInfoUrl = `${config.EXTERNAL_SERVICE_URL}${config.EXTERNAL_PATH_ALREADY_REGISTERED}`

  return getClaim('IntSchema', claimId)
    .then(function (claim) {
      var dateOfJourneyString = moment(claim.DateOfJourney).format('D MMMM YYYY')

      return getFirstNameByClaimId('IntSchema', claimId)
        .then(function (firstName) {
          var personalisation = {reference: reference, requestInfoUrl: requestInfoUrl, dateOfJourney: dateOfJourneyString, first_name: firstName}
          var emailAddress = task.additionalData
          var emailTemplateId = config.NOTIFY_ADVANCE_CLAIM_EVIDENCE_REMINDER_TEMPLATE_ID

          return sendNotification(emailTemplateId, emailAddress, personalisation)
        })
    })
}
