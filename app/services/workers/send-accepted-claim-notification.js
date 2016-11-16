const config = require('../../../config')
const sendNotification = require('../notify/send-notification')
const getApprovedClaimExpenseData = require('../data/get-approved-claim-expense-data')

module.exports.execute = function (task) {
  var claimId = task.claimId
  var reference = task.reference
  var personalisation = {reference: reference} // TODO payment breakdown
  var claimExpenses

  var emailAddress = task.additionalData
  var emailTemplateId = config.NOTIFY_ACCEPTED_CLAIM_EMAIL_TEMPLATE_ID
  return getApprovedClaimExpenseData.getClaimExpenseData(claimId)
    .then(function(claimExpenseData) {
      claimExpenses = claimExpenseData
    })
    .then(function() {
      return getApprovedClaimExpenseData.getClaimantData(reference, claimId)
    })
    .then(function(claimantData) {
      var personalisation = {
        first_name: claimantData.VisitorFirstName,
        reference: reference,
        claim_details: buildClaimExpenseDetailsString(claimExpenses),
        account_last_four_digits: claimantData.AccountNumberLastFourDigits,
        approved_amount: getTotalApprovedAmount(claimExpenses)
      }

  return sendNotification(emailTemplateId, emailAddress, personalisation)
      var emailAddress = task.additionalData
      var emailTemplateId = config.NOTIFY_ACCEPTED_CLAIM_EMAIL_TEMPLATE_ID

      return sendNotification(emailTemplateId, emailAddress, personalisation)
    })
}

function getTotalApprovedAmount(claims) {
  var totalApprovedAmount = 0

  claims.forEach(function(claim) {
    totalApprovedAmount += claim.ApprovedCost
  })

  return "£" + totalApprovedAmount.toFixed(2)
}

function buildClaimExpenseDetailsString(claims) {
  var result = []
  var newLine = "\r\n"

  // Append "Your claim details" to top of string if there are any claims expenses to show
  if (claims.length > 0) {
    result.push("Your claim details")
    result.push(newLine)
  }
  else {
    return ""
  }

  claims.forEach(function(claim) {
    var claimType = ""

    var claimExpenseJourneyTypes = {
      "car": "Car journey",
      "bus": "Bus journey",
      "train": "Train journey",
      "taxi": "Taxi journey",
      "plane": "Flight",
      "ferry": "Ferry"
    }

    var claimExpenseNonJourneyTypes = {
      "toll": "Toll",
      "parking charge": "Parking charge",
      "car hire": "Car hire",
      "light refreshment": "Light Refreshment",
      "accommodation": "Accommodation"
    }

    var claimHeader = ""

    //Claim description for journeys: (ExpenseType) - (From) to (To) (- return)
    if (claimExpenseJourneyTypes[claim.ExpenseType] != null) {
      claimType = claimExpenseJourneyTypes[claim.ExpenseType]
      claimHeader = claimType + " - " + claim.From + " to " + claim.To + (claim.IsReturn ? " - Return" : "")
    }
    //Claim description for non-journeys: (ExpenseType)
    else if (claimExpenseNonJourneyTypes[claim.ExpenseType] != null) {
      claimHeader = claimExpenseNonJourneyTypes[claim.ExpenseType]
    }

    result.push(claimHeader)
    result.push("  Claimed: £" + claim.Cost.toFixed(2))
    result.push("  Approved: £" + (claim.ApprovedCost || 0).toFixed(2))
    result.push(newLine)
  })

  return result.join(newLine)
}
