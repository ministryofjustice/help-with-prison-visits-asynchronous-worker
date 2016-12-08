const config = require('../../../config')
const sendNotification = require('../notify/send-notification')
const getApprovedClaimExpenseData = require('../data/get-approved-claim-expense-data')
const getEnabledClaimDeductions = require('../data/get-enabled-claim-deductions')
const getApprovedClaimDetailsString = require('../notify/helpers/get-approved-claim-details-string')

module.exports.execute = function (task) {
  var claimId = task.claimId
  var reference = task.reference
  var claimExpenseData
  var claimantData

  return getApprovedClaimExpenseData(claimId)
    .then(function (expenseData) {
      claimExpenseData = expenseData.claimExpenseData
      claimantData = expenseData.claimantData

      return getEnabledClaimDeductions(claimId)
    })
    .then(function (claimDeductions) {
      var firstName = claimantData.VisitorFirstName || ''
      var accountLastFourDigits = claimantData.AccountNumberLastFourDigits || ''
      var caseworkerNote = claimantData.CaseworkerNote || ''

      var personalisation = {
        first_name: firstName,
        reference: reference,
        claim_details: getApprovedClaimDetailsString(claimExpenseData, claimDeductions),
        account_last_four_digits: accountLastFourDigits,
        approved_amount: getTotalApprovedAmount(claimExpenseData, claimDeductions),
        caseworker_note: formatCaseworkerNote(caseworkerNote)
      }

      var emailAddress = task.additionalData
      var emailTemplateId = config.NOTIFY_ACCEPTED_CLAIM_EMAIL_TEMPLATE_ID

      return sendNotification(emailTemplateId, emailAddress, personalisation)
    })
}

function getTotalApprovedAmount (claimExpenses, claimDeductions) {
  var totalApprovedAmount = 0

  claimExpenses.forEach(function (claimExpense) {
    totalApprovedAmount += claimExpense.ApprovedCost
  })

  claimDeductions.forEach(function (claimDeduction) {
    totalApprovedAmount -= claimDeduction.Amount
  })

  return `£${totalApprovedAmount.toFixed(2)}`
}

function formatCaseworkerNote (caseworkerNote) {
  if (caseworkerNote) {
    var result = []
    var newLine = '\r\n'

    // Extra new line at start and end to create gap between note and adjacent sections
    result.push(newLine)
    result.push('Case worker note:')
    result.push(caseworkerNote)
    result.push(newLine)

    return result.join(newLine)
  } else {
    return ''
  }
}
