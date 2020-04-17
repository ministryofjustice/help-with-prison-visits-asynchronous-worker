const config = require('../../../config')
const sendNotification = require('../notify/send-notification')
const getApprovedClaimExpenseData = require('../data/get-approved-claim-expense-data')
const getEnabledClaimDeductions = require('../data/get-enabled-claim-deductions')
const getApprovedClaimDetailsString = require('../notify/helpers/get-approved-claim-details-string')
const prisonsEnum = require('../../constants/prisons-enum')
const enumHelper = require('../../constants/helpers/enum-helper')
const paymentMethodEnum = require('../../constants/payment-method-enum')

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
      var paymentMethod = claimantData.PaymentMethod || ''
      var isAdvanceClaim = claimantData.IsAdvanceClaim
      var town = claimantData.Town || ''
      var prison = claimantData.Prison ? enumHelper.getKeyByValue(prisonsEnum, claimantData.Prison).displayName : ''

      var personalisation = standardPersonalisationElements(firstName, reference, town, prison, caseworkerNote)
      var emailTemplateId

      if (paymentMethod === paymentMethodEnum.DIRECT_BANK_PAYMENT.value) {
        personalisation.account_last_four_digits = accountLastFourDigits
        if (isAdvanceClaim) {
          emailTemplateId = config.NOTIFY_ACCEPTED_CLAIM_ADVANCE_BANK_EMAIL_TEMPLATE_ID
        } else {
          personalisation.claim_details = getApprovedClaimDetailsString(claimExpenseData, claimDeductions)
          personalisation.approved_amount = getTotalApprovedAmount(claimExpenseData, claimDeductions)
          emailTemplateId = config.NOTIFY_ACCEPTED_CLAIM_BANK_EMAIL_TEMPLATE_ID
        }
      } else if (paymentMethod === paymentMethodEnum.PAYOUT.value) {
        if (isAdvanceClaim) {
          emailTemplateId = config.NOTIFY_ACCEPTED_CLAIM_ADVANCE_PAYOUT_EMAIL_TEMPLATE_ID
        } else {
          personalisation.claim_details = getApprovedClaimDetailsString(claimExpenseData, claimDeductions)
          personalisation.approved_amount = getTotalApprovedAmount(claimExpenseData, claimDeductions)
          emailTemplateId = config.NOTIFY_ACCEPTED_CLAIM_PAYOUT_EMAIL_TEMPLATE_ID
        }
      } else {
        return Promise.reject(new Error('No payment method found'))
      }

      var emailAddress = task.additionalData
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
    result.push('Note from case worker:')
    result.push(`"${caseworkerNote}"`)
    result.push(newLine)

    return result.join(newLine)
  } else {
    return ''
  }
}

function standardPersonalisationElements (firstName, reference, town, prison, caseworkerNote) {
  return {
    first_name: firstName,
    reference: reference,
    start_town: town,
    prison: prison,
    caseworker_note: formatCaseworkerNote(caseworkerNote)
  }
}
