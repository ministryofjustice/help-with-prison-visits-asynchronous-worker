const config = require('../../../config')
const sendNotification = require('../notify/send-notification')
const getApprovedClaimExpenseData = require('../data/get-approved-claim-expense-data')
const buildClaimExpenseDetailsString = require('../notify/helpers/get-approved-claim-details-string')

module.exports.execute = function (task) {
  var claimId = task.claimId
  var reference = task.reference

  return getApprovedClaimExpenseData(reference, claimId)
    .then(function (claimData) {
      var personalisation = {
        first_name: claimData.claimantData.VisitorFirstName,
        reference: reference,
        claim_details: buildClaimExpenseDetailsString(claimData.claimExpenseData),
        account_last_four_digits: claimData.claimantData.AccountNumberLastFourDigits,
        approved_amount: getTotalApprovedAmount(claimData.claimExpenseData)
      }

      var emailAddress = task.additionalData
      var emailTemplateId = config.NOTIFY_ACCEPTED_CLAIM_EMAIL_TEMPLATE_ID

      return sendNotification(emailTemplateId, emailAddress, personalisation)
    })
}

function getTotalApprovedAmount (claims) {
  var totalApprovedAmount = 0

  claims.forEach(function (claim) {
    totalApprovedAmount += claim.ApprovedCost
  })

  return `£${totalApprovedAmount.toFixed(2)}`
}

